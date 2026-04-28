import ky from 'ky'
import { AuthService } from '../services/AuthService';

export const apiClient = ky.create({
    prefix: '/api',
    credentials: 'include',
    hooks: {
        beforeRequest: [
            ({ request }) => {
                const token = AuthService.getToken()
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        ],

        afterResponse: [
            async ({ request, response, retryCount }) => {
                if (response.status === 401 && retryCount === 0) {
                    try {
                        const { token } = await ky.post('/api/refresh', { credentials: 'include' }).json<{ token: string }>();

                        const headers = new Headers(request.headers);
                        headers.set('Authorization', `Bearer ${token}`);

                        AuthService.addToken(token);

                        return ky.retry({
                            request: new Request(request, { headers }),
                            code: 'TOKEN_REFRESHED'
                        });
                    } catch {
                        AuthService.removeToken();
                        window.location.href = '/#/login';
                        return;
                    }
                }
            },
        ]
    },
});