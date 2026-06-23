import { app } from "./app.js";
import { bindAddress, isProd, port } from "./config.js";

app.listen(Number(port), bindAddress, (err?: Error) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode.`);
    console.log(`Listening on http://${bindAddress}:${port}`);
});
