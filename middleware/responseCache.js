const cache = new Map();
const DEFAULT_TTL_MS = 10 * 1000;

function clearResponseCache() {
    cache.clear();
}

function responseCache(ttlMs = DEFAULT_TTL_MS) {
    return (req, res, next) => {
        if (req.method !== "GET") {
            next();
            return;
        }

        const key = `${req.baseUrl}${req.originalUrl}`;
        const cached = cache.get(key);

        if (cached && cached.expiresAt > Date.now()) {
            res.set("X-Response-Cache", "HIT");
            res.json(cached.body);
            return;
        }

        if (cached) {
            cache.delete(key);
        }

        const originalJson = res.json.bind(res);
        res.json = body => {
            if (res.statusCode < 400) {
                cache.set(key, {
                    body,
                    expiresAt: Date.now() + ttlMs
                });
                res.set("X-Response-Cache", "MISS");
            }
            return originalJson(body);
        };

        next();
    };
}

module.exports = responseCache;
module.exports.clearResponseCache = clearResponseCache;