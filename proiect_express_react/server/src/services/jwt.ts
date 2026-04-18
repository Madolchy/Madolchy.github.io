import { expressjwt } from "express-jwt";

const JWT_SECRET = process.env.JWT_SECRET;

export const requireAuth = expressjwt({
    secret: JWT_SECRET,
    algorithms: ["HS256"],
});

