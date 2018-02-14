import pify from './internal/pify';

export default function (coll, iter, mainCb) {
    coll.reduce(
        (p, item) => p.then(() => pify(iter)(item)),
        Promise.resolve([])
    ).then(() => {
        mainCb(null);
    }).catch(mainCb);
};
