import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    id: string;
    rootFolderId: string;
}

export const AuthService = {
    getToken: () => {
        return localStorage.getItem("jwt");
    },

    hasToken: () => {
        const token = AuthService.getToken();
        if (!token) return false;

        const tokenData = jwtDecode(token);
        if (!tokenData) return false;

        return true;
    },

    getRootFolderId: (): string | null => {
        const token = AuthService.getToken();
        if (!token) return null;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.rootFolderId ?? null;
        } catch {
            return null;
        }
    },

    addToken: (token: string) => {
        localStorage.setItem("jwt", token);
    },

    removeToken: () => {
        localStorage.removeItem("jwt");
    },
};
