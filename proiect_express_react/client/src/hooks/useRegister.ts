import { apiClient } from "@/client/apiClient";
import { RegisterSchema, type RegisterFormInputs } from "@/types/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useRegister() {
    const navigate = useNavigate();

    const registerForm = useForm<RegisterFormInputs>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            iAgree: false,
        },
    });

    const registerUser = async (userData: RegisterFormInputs) => {
        const response = await apiClient.post("register", {
            json: userData,
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || "Backend Error");
        }

        return data;
    };

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem("jwt", data.token);
                navigate("/desktop");
            } else {
                navigate("/login");
            }
        },
    });

    const onSubmit = (validData: RegisterFormInputs) => {
        registerMutation.mutate(validData);
    };

    return {
        ...registerForm,
        onSubmit,
        isLoading: registerMutation.isPending,
        isError: registerMutation.isError,
        error: registerMutation.error,
    };
}
