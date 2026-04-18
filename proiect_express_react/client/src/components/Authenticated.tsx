import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export function Authenticated({ children }) {
    const isValid = AuthService.isTokenValid()

    if (!isValid) {
        // AuthService.removeToken()
        return <Navigate to="/login" replace />;
    }

    return children;
}

export function Unauthenticated({ children }) {
    const isValid = AuthService.isTokenValid()

    if (isValid) {
        return <Navigate to="/desktop" replace />;
    }

    // AuthService.removeToken();
    return children;
}