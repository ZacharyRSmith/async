// import pify from './internal/pify';

function Q({ concurrency, worker }) {
    this._concurrency = concurrency;
    Object.defineProperty(this, 'concurrency', {
        get: function () { return this._concurrency; },
        set: function (newConcurrency) {
            this._concurrency = newConcurrency;
            this._initNextTasks();
        }
    });
    // Object.defineProperty(this, 'concurrency', { set: function (val) { this._concurrency = val; } });
    this._running = 0;
    this._length = 0;
    this._worker = worker;
    // TODO "rotate" idx...but that wouldn't account for super long tasks getting "lapped"...
    // use something w/insertion order...but that wouldn't allow for unshift()
    // need a maintenance task to reorder/sort q?
    // for now, assume this solution is OK
    this._q = [];
    this._nextTaskIdx = 0;

    // a boolean indicating whether or not any items have been pushed and processed by the queue.
    this.started = false;
}
Q.prototype._drain = function _drain() {
    if (typeof this.drain === 'function') this.drain();
};
// a callback that is called when a task errors.
Q.prototype._error = function _error({ error, task }) {
    if (typeof this.error === 'function') this.error(error, task);
}
Q.prototype._initNextTasks = function _initNextTasks() {
    const numTasksToInit = Math.min(
        this.concurrency - this.running(),
        this._length
    );

    setTimeout(() => {
        Array(numTasksToInit).fill(this._next.bind(this)).forEach(fn => fn());
    }, 0);
}
// Returns the number of items waiting to be processed.
Q.prototype.length = function length() {
    return this._length;
};
Q.prototype._next = function _next() {
    if (this.length() === 0) {
        if (this.running() === 0) return void this._drain();
        return;
    }
    if (this.running() >= this.concurrency) return;
    const thisTaskIdx = this._nextTaskIdx;
    this.started = true;
    this._nextTaskIdx += 1;
    this._length -= 1;
    this._running += 1;

    const { cb, task } = this._q[thisTaskIdx];
    setTimeout(() => {
        this._worker(task, (workerErr, ...results) => {
            delete this._q[thisTaskIdx];
            this._running -= 1;
            if (workerErr) this._error({ error: workerErr, task });
            if (typeof cb === 'function') cb(workerErr, ...results);

            this._next();
        });
    }, 0);
};
// unshift:
// returns the number of items currently being processed.
Q.prototype.running = function running() {
    return this._running;
};
Q.prototype.push = function push(taskOrTasks, mainCb) {
    [].concat(taskOrTasks).forEach((task) => {
        this._length += 1;
        this._q.push({ cb: mainCb, task });
    });

    this._initNextTasks();
};

export default function (worker/*: Function */, concurrency/*: ?number */ = 1) {
    if (concurrency === 0) throw new Error(`@concurrency should not be '0'.`);

    return new Q({ concurrency, worker });
};
