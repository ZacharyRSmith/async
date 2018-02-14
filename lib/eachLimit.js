import pify from './internal/pify';

export default function (coll, limit, iter, mainCb) {
    if (limit === 0) return void mainCb(null);
    let concurrency = 0;
    let mainErr = null;
    let nextIdx = -1;

    const done = (doneErr) => {
        if (mainErr) return;
        if (doneErr) {
            mainErr = doneErr;
        }
        typeof mainCb === 'function' && mainCb(mainErr);
    }
    const next = () => {
        if (mainErr) return;
        nextIdx += 1;
        const thisIdx = nextIdx;
        if (thisIdx >= coll.length) {
            if (concurrency === 0) {
                return void done(null);
            }
            return;
        }
        concurrency += 1;
        pify(iter)(coll[thisIdx])
        .then(() => {
            concurrency -= 1;
            next();
        })
        .catch(done);
    };

    Array(Math.min(limit, coll.length)).fill(next).forEach(next => next());
};
