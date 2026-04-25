import ky from 'ky'
import { AuthService } from '../services/AuthService';

export const apiClient = ky.create({
    prefix: '/api',
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
                    const { token } = await ky.post('/api/refresh').json();

                    const headers = new Headers(request.headers);
                    headers.set('Authorization', `Bearer ${token}`);

                    AuthService.addToken(token);

                    return ky.retry({
                        request: new Request(request, { headers }),
                        code: 'TOKEN_REFRESHED'
                    });
                }
            },
        ]
    },
});