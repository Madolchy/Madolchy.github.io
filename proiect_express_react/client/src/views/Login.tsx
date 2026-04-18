import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const LoginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof LoginSchema>;

const loginUser = async (credentials: LoginFormInputs) => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error("Internal Server Error")
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error("Backend Error")
    }

    
    return data;
};

export default function Login() {
    const navigate = useNavigate();

    // 3. Initialize React Hook Form with Zod
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem('jwt', data.token);
            }
            
            navigate('/desktop');
        },
    });

    const onSubmit = (validData: LoginFormInputs) => {
        loginMutation.mutate(validData);
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
                                            <h2 className="h3">Sign In</h2>
                                            <h3 className="fs-6 fw-normal text-secondary m-0">Enter your details to log in to your account</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Display Backend API Errors from TanStack Query */}
                                {loginMutation.isError && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        {loginMutation.error.message}
                                    </div>
                                )}

                                {/* Wrap the form in React Hook Form's handleSubmit */}
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row gy-3 overflow-hidden">
                                        <div className="col-12">
                                            <div className="form-floating mb-1">
                                                <input 
                                                    type="email" 
                                                    // Add dynamic class if there's an error for standard Bootstrap red styling
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                                    id="email" 
                                                    placeholder="name@example.com" 
                                                    {...register('email')} // Replaces value & onChange
                                                />
                                                <label className="form-label" htmlFor="email">Email</label>
                                            </div>
                                            {/* Zod Validation Error Message */}
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
                                            {/* Zod Validation Error Message */}
                                            {errors.password && (
                                                <small className="text-danger ps-2">{errors.password.message}</small>
                                            )}
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id="rememberMe" 
                                                    {...register('rememberMe')}
                                                />
                                                <label className="form-check-label text-secondary" htmlFor="rememberMe">
                                                    Remember me
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4">
                                            <div className="d-grid">
                                                <button 
                                                    className="btn bsb-btn-2xl btn-primary" 
                                                    type="submit" 
                                                    // Disable button if loading or if there are frontend errors
                                                    disabled={loginMutation.isPending}
                                                >
                                                    {loginMutation.isPending ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                
                                <div className="row">
                                    <div className="col-12">
                                        <hr className="mt-5 mb-4 border-secondary-subtle" />
                                        <p className="m-0 text-secondary text-center">
                                            Don't have an account? <Link to="/register" className="link-primary text-decoration-none">Sign up</Link>
                                        </p>
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