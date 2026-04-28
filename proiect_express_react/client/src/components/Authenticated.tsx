import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export function Authenticated({ children }) {
    const hasToken = AuthService.hasToken()

    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export function Unauthenticated({ children }) {
    const hasToken = AuthService.hasToken()

    if (hasToken) {
        return <Navigate to="/desktop" replace />;
    }

    return children;
}