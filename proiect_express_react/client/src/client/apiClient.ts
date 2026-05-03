import ky from "ky";
import { AuthService } from "../services/AuthService";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = ky.create({
    prefix: BASE_URL,
    credentials: "include",
    hooks: {
        beforeRequest: [
            ({ request }) => {
                const token = AuthService.getToken();
                if (token) {
                    request.headers.set("Authorization", `Bearer ${token}`);
                }
            },
        ],

        afterResponse: [
            async ({ request, response, retryCount }) => {
                if (response.status === 401 && retryCount === 0) {
                    try {
                        console.log("Trying to get refresh token");
                        const { token } = await ky
                            .post(`${BASE_URL}/refresh`, { credentials: "include" })
                            .json<{ token: string }>();

                        const headers = new Headers(request.headers);
                        headers.set("Authorization", `Bearer ${token}`);

                        AuthService.addToken(token);

                        return ky.retry({
                            request: new Request(request, { headers }),
                            code: "TOKEN_REFRESHED",
                        });
                    } catch {
                        AuthService.removeToken();
                        window.location.href = "/#/login";
                        return;
                    }
                }
            },
        ],
    },
});
