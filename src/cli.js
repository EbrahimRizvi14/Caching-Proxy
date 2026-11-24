const args = process.argv.slice(2);

let port = 3000;
let origin = "https://dummyjson.com";

let clearCache = false;

const seenArgs = new Set();

for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Check for unknown arguments
    if (!["--port", "--origin", "--clear-cache"].includes(arg)) {
        console.error(`Error: Unknown argument "${arg}".`);
        process.exit(1);
    }

    // Check for duplicate arguments
    if (seenArgs.has(arg)) {
        console.error(`Error: "${arg}" was provided more than once.`);
        process.exit(1);
    }

    seenArgs.add(arg);

    // Handle clear-cache
    if (arg === "--clear-cache") {
        clearCache = true;
        continue;
    }

    // Check whether the argument has a value
    const value = args[i + 1];

    if (!value || value.startsWith("--")) {
        console.error(`Error: "${arg}" requires a value.`);
        process.exit(1);
    }

    // Handle port
    if (arg === "--port") {
        if (!/^\d+$/.test(value)) {
            console.error("Error: Port must be a valid number.");
            process.exit(1);
        }

        port = Number(value);

        if (port < 1 || port > 65535) {
            console.error("Error: Port must be between 1 and 65535.");
            process.exit(1);
        }
    }

    // Handle origin
    if (arg === "--origin") {
        try {
            const parsedUrl = new URL(value);

            if (
                !["http:", "https:"].includes(parsedUrl.protocol) ||
                !parsedUrl.hostname
            ) {
                throw new Error();
            }

            origin = parsedUrl.origin;

        } catch {
            console.error("Error: Please provide a valid HTTP or HTTPS origin URL.");
            process.exit(1);
        }
    }

    i++;
}

if (clearCache) {
    fetch(`http://127.0.0.1:${port}/__clear-cache`, {
        method: "POST"
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(await response.text());
        })
        .catch(error => {
            console.error("Could not clear cache:", error.message);
            console.error("Is your proxy server running?");
        });

} else {
    process.env.PORT = port;
    process.env.ORIGIN = origin;

    require("./server");
}

console.log("Port:", port);
console.log("Origin:", origin);