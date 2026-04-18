import { jwtDecode } from "jwt-decode";


export const AuthService = {
    getToken: () => {
        return localStorage.getItem('jwt');
    },

    isTokenValid: () => {
        const token = AuthService.getToken();
        if (!token) return false;

        const tokenData = jwtDecode(token);
        if (!tokenData || !tokenData.exp) return false;

        if (tokenData.exp < Date.now() / 1000) return false

        return true;

    },

    removeToken: () => {
        localStorage.removeItem('jwt')
    }
}