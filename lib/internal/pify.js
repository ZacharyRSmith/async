export default (fn) => (...args) => new Promise((resolve, reject) => {
    let timesCbCalled = 0;
    fn(...args, (mainErr, results) => {
        timesCbCalled += 1;
        if (timesCbCalled > 1) throw new Error('Callback called more than once.');
        if (mainErr) return void reject(mainErr);
        resolve(results);
    })
});
