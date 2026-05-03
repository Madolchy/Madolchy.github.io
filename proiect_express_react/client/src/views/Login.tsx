import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        onSubmit,
        isLoading,
        isError,
        error,
    } = useLogin();

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
                                            <h3 className="fs-6 fw-normal text-secondary m-0">
                                                Enter your details to log in to your account
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {isError && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        {error?.message || "An error occurred during login."}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row gy-3 overflow-hidden">
                                        <div className="col-12">
                                            <div className="form-floating mb-1">
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                    id="email"
                                                    placeholder="name@example.com"
                                                    {...register("email")}
                                                />
                                                <label className="form-label" htmlFor="email">
                                                    Email
                                                </label>
                                            </div>
                                            {errors.email && (
                                                <small className="text-danger ps-2">{errors.email.message}</small>
                                            )}
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="form-floating mb-1">
                                                <input
                                                    type="password"
                                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                                    id="password"
                                                    placeholder="Password"
                                                    {...register("password")}
                                                />
                                                <label className="form-label" htmlFor="password">
                                                    Password
                                                </label>
                                            </div>
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
                                                    {...register("rememberMe")}
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
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Logging in..." : "Log in"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="row">
                                    <div className="col-12">
                                        <hr className="mt-5 mb-4 border-secondary-subtle" />
                                        <p className="m-0 text-secondary text-center">
                                            Don't have an account?{" "}
                                            <Link to="/register" className="link-primary text-decoration-none">
                                                Sign up
                                            </Link>
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
