const args = process.argv.slice(2);

let port = 3000;
let origin = "https://dummyjson.com";

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port") {
        port = Number(args[i + 1]);
    }

    if (args[i] === "--origin") {
        origin = args[i + 1];
    }
}

process.env.PORT = port;
process.env.ORIGIN = origin;

require("./server");

console.log("Port:", port);
console.log("Origin:", origin);