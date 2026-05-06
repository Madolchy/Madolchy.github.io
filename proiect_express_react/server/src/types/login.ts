import z from "zod";

export const SignupRequestSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

type SignupRequest = z.infer<typeof SignupRequestSchema>;
