import { jwtDecode } from "jwt-decode";


export const AuthService = {
    getToken: () => {
        return localStorage.getItem('jwt');
    },

    hasToken: () => {
        const token = AuthService.getToken();
        if (!token) return false;

        const tokenData = jwtDecode(token);
        if (!tokenData) return false;

        return true;
    },

    addToken: (token: string) => {
        localStorage.setItem('jwt', token);
    },

    removeToken: () => {
        localStorage.removeItem('jwt')
    }
}