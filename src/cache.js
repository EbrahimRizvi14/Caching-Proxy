
const cache = new Map();

const TTL = 60 * 1000;

function get(key) {
    const item = cache.get(key);

    if (!item) {
        return undefined;
    }

    if (Date.now() >= item.expiresAt) {
        cache.delete(key);
        return undefined;
    }

    return item.value;
}

function set(key, value) {
    cache.set(key, {
        value: value,
        expiresAt: Date.now() + TTL
    });
}

function clear() {
    cache.clear();
}

module.exports = {
    get,
    set,
    clear
};
