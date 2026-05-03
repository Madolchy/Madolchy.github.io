import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const AuthService = {
    generateToken: (payload: { id: string }) => {
        return jwt.sign({ ...payload, tokenType: "active" }, JWT_SECRET as jwt.Secret, { expiresIn: "10s" });
    },

    generateRefreshToken: (payload: { id: string }) => {
        return jwt.sign({ ...payload, tokenType: "refresh" }, JWT_SECRET as jwt.Secret, { expiresIn: "7d" });
    },

    verifyToken: (token: string) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);

            // Explicitly check that this is a refresh token
            if (decoded.tokenType !== "refresh") {
                console.error("Attempted to use a non-refresh token for a refresh operation");
                return null;
            }

            return decoded;
        } catch (error) {
            return null;
        }
    },
};
