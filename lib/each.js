import pify from './internal/pify';

export default function(coll, iter, mainCb) {
    const ps = coll.map(item => pify(iter)(item));
    Promise.all(ps)
    .then(() => {
        mainCb(null);
    })
    .catch(mainCb);
};
