import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { LoginSchema, type LoginFormInputs } from "../types/login";
import { loginUser } from "../views/Login_logic";

export function useLogin() {
    const navigate = useNavigate();

    const formMethods = useForm<LoginFormInputs>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.token) {
                AuthService.addToken(data.token);
            }
            navigate("/desktop");
        },
    });

    const onSubmit = (validData: LoginFormInputs) => {
        loginMutation.mutate(validData);
    };

    return {
        ...formMethods,
        onSubmit,
        isLoading: loginMutation.isPending,
        isError: loginMutation.isError,
        error: loginMutation.error,
    };
}
