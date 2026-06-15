module.exports = {
    apps: [
        // ── Production ──────────────────────────────────────
        {
            name: "server-prod",
            script: "src/server.ts",
            interpreter: "./node_modules/.bin/tsx",
            cwd: __dirname,
            exec_mode: "cluster",
            instances: 4,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
            },
        },

        // ── Dev ─────────────────────────────────────────────
        {
            name: "server-dev",
            script: "src/server.ts",
            interpreter: "./node_modules/.bin/tsx",
            cwd: __dirname,
            exec_mode: "fork",
            instances: 4,
            autorestart: true,
            watch: ["src"],
            watch_delay: 1000,
            ignore_watch: ["node_modules", "dist", ".git", "prisma"],
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "development",
            },
        },
    ],
};
