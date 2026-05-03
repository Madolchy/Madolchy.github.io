import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export function Authenticated({ children }) {
    console.log("Does this run everytime?");
    const hasToken = AuthService.hasToken();

    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export function Unauthenticated({ children }) {
    console.log("Does this run everytime?");
    const hasToken = AuthService.hasToken();

    if (hasToken) {
        return <Navigate to="/desktop" replace />;
    }

    return children;
}
