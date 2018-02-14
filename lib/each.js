export default function(coll, iter, mainCb) {
    const ps = coll.map(item => new Promise((resolve, reject) => {
        let timesCbCalled = 0;
        iter(item, (iterErr) => {
            timesCbCalled += 1;
            if (timesCbCalled > 1) throw new Error('BOOM!');
            if (iterErr) return void reject(iterErr);
            resolve();
        });
    }));
    Promise.all(ps)
    .then(() => {
        mainCb(null);
    })
    .catch(mainCb);
};
