const args = process.argv.slice(2);

let port = 3000;
let origin = "https://dummyjson.com";

let clearCache = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port") {
        port = Number(args[i + 1]);
    }

    if (args[i] === "--origin") {
        origin = args[i + 1];
    }

    if (args[i] === "--clear-cache") {
        clearCache = true;
    }
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