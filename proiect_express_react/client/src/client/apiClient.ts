import ky from 'ky'
import { AuthService } from '../services/AuthService';

export const apiClient = ky.create({
    prefix: '/api',
    hooks: {
        beforeRequest: [
            ({ request}) => {
                const token = AuthService.getToken()
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        ]
    }
});