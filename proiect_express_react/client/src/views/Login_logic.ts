import z from "zod";
import { apiClient } from "../client/apiClient";

export const loginUser = async (credentials: LoginFormInputs) => {
    try {
        const data = await apiClient
            .post("login", {
                json: credentials,
            })
            .json<any>();

        if (!data.success) {
            throw new Error("Backend Error");
        }

        return data;
    } catch (error: any) {
        throw new Error(error?.message || "Internal Server Error");
    }
};
