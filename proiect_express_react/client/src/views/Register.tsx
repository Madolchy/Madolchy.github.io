import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../client/apiClient';

const RegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    iAgree: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and conditions",
    }),
});

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

const registerUser = async (userData: RegisterFormInputs) => {
    try {
        const data = await apiClient.post('register', {
            json: userData,
        }).json<any>();

        if (!data.success) {
            throw new Error(data.message || "Backend Error");
        }

        return data;
    } catch (error: any) {
        throw new Error(error?.message || "Internal Server Error");
    }
};

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            iAgree: false,
        }
    });

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem('jwt', data.token);
                navigate('/desktop');
            } else {
                navigate('/login');
            }
        },
    });

    const onSubmit = (validData: RegisterFormInputs) => {
        registerMutation.mutate(validData);
    };

    return (
        <section className="bg-primary min-vh-100 d-flex flex-column justify-content-center p-3 p-md-4 p-xl-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-9 col-lg-7 col-xl-6 col-xxl-5">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-3 p-md-4 p-xl-5">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-5">
                                            <h2 className="h3">Pop</h2>
                                            <h3 className="fs-6 fw-normal text-secondary m-0">Enter your details to register</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Display Backend API Errors */}
                                {registerMutation.isError && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        {registerMutation.error.message}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row gy-3 overflow-hidden">
                                        <div className="col-12">
                                            <div className="form-floating mb-1">
                                                <input
                                                    type="name"
                                                    className={`form-control ${errors.name? 'is-invalid' : ''}`}
                                                    id="name"
                                                    placeholder="John Doe"
                                                    {...register('name')}
                                                />
                                                <label className="form-label" htmlFor="name">Name</label>
                                            </div>
                                            {errors.name && (
                                                <small className="text-danger ps-2">{errors.name.message}</small>
                                            )}

                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-1">
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                    id="email"
                                                    placeholder="name@example.com"
                                                    {...register('email')}
                                                />
                                                <label className="form-label" htmlFor="email">Email</label>
                                            </div>
                                            {errors.email && (
                                                <small className="text-danger ps-2">{errors.email.message}</small>
                                            )}
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="form-floating mb-1">
                                                <input
                                                    type="password"
                                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder="Password"
                                                    {...register('password')}
                                                />
                                                <label className="form-label" htmlFor="password">Password</label>
                                            </div>
                                            {errors.password && (
                                                <small className="text-danger ps-2">{errors.password.message}</small>
                                            )}
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="form-check">
                                                <input
                                                    className={`form-check-input ${errors.iAgree ? 'is-invalid' : ''}`}
                                                    type="checkbox"
                                                    id="iAgree"
                                                    {...register('iAgree')}
                                                />
                                                <label className="form-check-label text-secondary" htmlFor="iAgree">
                                                    I agree to the <a href="#!" className="link-primary text-decoration-none">terms and conditions</a>
                                                </label>
                                            </div>
                                            {errors.iAgree && (
                                                <small className="text-danger ps-2 d-block mt-1">{errors.iAgree.message}</small>
                                            )}
                                        </div>

                                        <div className="col-12 mt-4">
                                            <div className="d-grid">
                                                <button
                                                    className="btn bsb-btn-2xl btn-primary"
                                                    type="submit"
                                                    disabled={registerMutation.isPending}
                                                >
                                                    {registerMutation.isPending ? 'Signing up...' : 'Sign up'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="row">
                                    <div className="col-12">
                                        <hr className="mt-5 mb-4 border-secondary-subtle" />
                                        <p className="m-0 text-secondary text-center">
                                            Already have an account? <Link to="/login" className="link-primary text-decoration-none">Sign in</Link>
                                        </p>
                                    </div>
                                </div>

                                {/* Social Login Options */}
                                <div className="row">
                                    <div className="col-12">
                                        <p className="mt-5 mb-4 text-center">Or continue with</p>
                                        <div className="d-flex gap-3 flex-column">
                                            <a href="#!" className="btn bsb-btn-xl btn-danger">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                                                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                                                </svg>
                                                <span className="ms-2 fs-6 text-uppercase">Sign in With Google</span>
                                            </a>
                                            <a href="#!" className="btn bsb-btn-xl btn-primary">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                                                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                                                </svg>
                                                <span className="ms-2 fs-6 text-uppercase">Sign in With Facebook</span>
                                            </a>
                                            <a href="#!" className="btn bsb-btn-xl btn-info text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                                                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                                                </svg>
                                                <span className="ms-2 fs-6 text-uppercase">Sign in With Twitter</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}