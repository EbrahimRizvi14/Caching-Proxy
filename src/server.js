
const http = require("http");
const cache = require("./cache");

const ORIGIN = process.env.ORIGIN || "https://dummyjson.com";
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);

        if (req.method === "POST" && req.url === "/__clear-cache") {
        cache.clear();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            message: "Cache cleared successfully"
        }));    

        return; 
    }

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

        const hasBody = !["GET", "HEAD"].includes(req.method);

        const requestHeaders = new Headers(req.headers);

        for (const header of [
            "host",
            "connection",
            "keep-alive",
            "proxy-connection",
            "transfer-encoding",
            "upgrade",
            "expect"
        ]) {
            requestHeaders.delete(header);
        }

        const response = await fetch(originUrl, {
            method: req.method,
            headers: requestHeaders,
            ...(hasBody ? {
                body: req,
                duplex: "half"
            } : {})
        });

        const data = Buffer.from(await response.arrayBuffer());

        const headers = {
            "Content-Type": response.headers.get("content-type") || "application/octet-stream"
        };

        if (req.method === "GET" && response.ok) {
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

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Proxy running at http://localhost:${PORT}`);
});