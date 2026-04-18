import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import path from "path";
import { existsSync, readFileSync } from "fs";
import { promises } from "dns";


const CredentialsSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type StoredAccount = {
    email: string;
    hashedPassword: string;
    uuid: string;
};

let AccountRegistry: Record<string, StoredAccount> = {};

const DB_FILE = path.join(process.cwd(), "db", "accounts.json");
if (existsSync(DB_FILE)) {
    const rawData = readFileSync(DB_FILE, 'utf-8');
    AccountRegistry = JSON.parse(rawData);
    console.log("Loaded existing accounts from disk.");
}

const saveRegistryToDisk = async () => {
    try {
        const jsonString = JSON.stringify(AccountRegistry, null, 2);
        await fs.writeFile(DB_FILE, jsonString, 'utf-8');
    } catch (error) {
        console.error("CRITICAL: Failed to write accounts to disk!", error);
    }
}

export const AuthService = {
    register: async (requestBody: unknown) => {
        // Validate incoming data
        const validationResult = CredentialsSchema.safeParse(requestBody);

        if (!validationResult.success) {
            return { success: false, message: "Invalid body form", errors: validationResult.error }
        }

        const { email, password } = validationResult.data;
        if (AccountRegistry[email]) {
            return { success: false, message: "Account already exists" };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAccount: StoredAccount = {
            email: email,
            hashedPassword: hashedPassword,
            uuid: uuidv4(),
        };

        AccountRegistry[email] = newAccount;

        saveRegistryToDisk();
        return { success: true };

    },

    login: async (requestBody: unknown) => {
        const validationResult = CredentialsSchema.safeParse(requestBody);

        if (!validationResult.success) {
            return { success: false, message: "Invalid body form" }
        }

        const { email, password } = validationResult.data;

        const account = AccountRegistry[email];
        if (!account) {
            return { success: false, message: "Account doesn't exist" };
        }

        const isMatch = await bcrypt.compare(password, account.hashedPassword);
        if (!isMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        const token = jwt.sign(
            { id: account.uuid },
            process.env.JWT_SECRET as jwt.PrivateKey,
            { expiresIn: '1h' }
        );

        return { success: true, message: "Logged in", token: token }
    }
}