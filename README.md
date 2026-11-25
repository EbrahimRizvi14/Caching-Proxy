# Caching Proxy Server

A lightweight Node.js HTTP proxy that forwards requests, caches responses, and tracks cache hits and misses.

This project was built for the [roadmap.sh Caching Server project](https://roadmap.sh/projects/caching-server).

## Features

- Forwards HTTP requests to a configurable origin server.
- Caches successful `GET` responses in memory for 60 seconds.
- Marks responses with `X-Cache: HIT` or `X-Cache: MISS`.
- Supports clearing the running server's cache from the command line.

## Tech Stack

- JavaScript (CommonJS)
- Node.js built-in HTTP server and `fetch` API
- In-memory `Map` cache; no third-party dependencies

## Requirements

- Node.js 18 or later (the server uses the built-in `fetch` API)

There are no third-party dependencies.

## Start the proxy

From the project directory, run:

```bash
node src/cli.js
```

By default, the proxy listens on `http://127.0.0.1:3000` and forwards requests to `https://dummyjson.com`.

You can set a different listening port and origin:

```bash
node src/cli.js --port 4000 --origin https://jsonplaceholder.typicode.com
```

Options:

| Option | Description | Default |
| --- | --- | --- |
| `--port <number>` | Local port to listen on (1–65535) | `3000` |
| `--origin <url>` | Base HTTP or HTTPS URL to forward requests to | `https://dummyjson.com` |
| `--clear-cache` | Clear the running proxy's in-memory cache | — |

## Make requests

With the default origin, for example:

```bash
curl -i http://127.0.0.1:3000/products
```

The first successful `GET` is fetched from the origin and returned with `X-Cache: MISS`. Repeat the request within 60 seconds to receive the cached response with `X-Cache: HIT`. Cache entries expire 60 seconds after they are stored.

The proxy forwards the request method, headers, and body to the origin. Only successful `GET` responses are cached; other methods and unsuccessful responses pass through without being cached.

## Clear the cache

While the proxy is running on the default port, run this in another terminal:

```bash
node src/cli.js --clear-cache
```

If you started the server on a different port, specify it when clearing the cache:

```bash
node src/cli.js --port 4000 --clear-cache
```

The clear operation affects the cache in the running server process. Restarting the proxy also clears it because the cache is held in memory.
