export const port = process.env.PORT || 3000;
export const isProd = process.env.NODE_ENV === "production";
export const bindAddress = process.env.BIND_ADDRESS || (isProd ? "0.0.0.0" : "127.0.0.1");

export const saltRounds = 10;
