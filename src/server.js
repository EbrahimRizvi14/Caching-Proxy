
const http = require("http");
const cache = require("./cache");

const ORIGIN = "https://dummyjson.com";

const server = http.createServer(async (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);

    // Check if the response is already cached
    const cacheKey = `${req.method}:${req.url}`;

    const cachedResponse = req.method === "GET"
        ? cache.get(cacheKey)
        : undefined;

    if (cachedResponse) {
        console.log("Cache HIT");

        res.writeHead(cachedResponse.status, {
            ...cachedResponse.headers,
            "X-Cache": "HIT"
        });

        res.end(cachedResponse.body);
        return;
    }

    console.log("Cache MISS");

    try {
        const originUrl = new URL(req.url, ORIGIN);

        const response = await fetch(originUrl, {
            method: req.method,
            headers: req.headers
        });

        const data = Buffer.from(await response.arrayBuffer());

        const headers = {
            "Content-Type": response.headers.get("content-type") || "application/octet-stream"
        };

        // Save the response in the cache
        if (req.method === "GET") {
            cache.set(cacheKey, {
                status: response.status,
                headers: headers,
                body: data
            });
        }
        res.writeHead(response.status, {
            ...headers,
            "X-Cache": "MISS"
        });

        res.end(data);

    } catch (error) {
        console.error("Proxy error:", error);

        res.writeHead(500, {
            "Content-Type": "text/plain"
        });

        res.end("Internal Proxy Error");
    }
});

server.listen(3000, () => {
    console.log("Proxy running at http://localhost:3000");
});
