import z from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    iAgree: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and conditions",
    }),
});

export type RegisterFormInputs = z.infer<typeof RegisterSchema>;
