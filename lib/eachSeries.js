export default function (coll, iter, mainCb) {
    const pify = (fn) => (...args) => new Promise((resolve, reject) => {
        fn(...args, (mainErr, ...results) => {
            if (mainErr) return void reject(mainErr);
            resolve(results);
        });
    });

    coll.reduce(
        (p, item) => p.then(() => pify(iter)(item)),
        Promise.resolve([])
    ).then(() => {
        mainCb(null);
    }).catch(mainCb);
};
