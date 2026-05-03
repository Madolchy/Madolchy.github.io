import { lazy, Suspense } from "react"; // Added Suspense
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Authenticated, Unauthenticated } from "./components/Authenticated";

const Login = lazy(() => import("./views/Login"));
const Register = lazy(() => import("./views/Register"));
const Desktop = lazy(() => import("./views/DesktopView"));

const routerConfig = createHashRouter([
    {
        path: "/",
        element: (
            <Authenticated>
                <Desktop />
            </Authenticated>
        ),
    },
    {
        path: "/login",
        element: (
            <Unauthenticated>
                <Login />
            </Unauthenticated>
        ),
    },
    {
        path: "/register",
        element: (
            <Unauthenticated>
                <Register />
            </Unauthenticated>
        ),
    },
    {
        path: "/desktop",
        element: (
            <Authenticated>
                <Desktop />
            </Authenticated>
        ),
    },
]);

export function AppRouter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={routerConfig} />
        </Suspense>
    );
}
