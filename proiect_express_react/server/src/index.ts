import 'dotenv/config';

import express from 'express';
import type { Request, Response } from 'express';
import { AuthService } from './services/.auth.js';
import { success } from 'zod';
import { DBService } from './services/auth.js';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { uploadService } from './services/diskStorageService.js';
import { requireAuth } from './services/jwt.js';
import { meta } from 'zod/v4/core';
import { FileManagerService } from './services/FileManagerService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express and TypeScript!');
});

app.post("/api/register", async (req: Request, res: Response) => {
    const result = await DBService.register_user(req);
    if (!result.success) {
        console.log(result)
        return res.status(400).json({
            success: false,
            message: result.message
        })
    }

    return res.status(200).json({
        success: true,
        message: "yay"
        // token: result.token
    })

})

app.post("/api/login", async (req: Request, res: Response) => {
    console.log("a")
    const result = await DBService.login_user(req);
    if (!result.success) {
        console.log(result)
        return res.status(400).json({
            success: false,
            message: "Login failed"
        })
    }

    return res.status(200).json({
        success: true,
        token: result.token
    })
})

app.post('/api/upload', requireAuth, uploadService.single('myFile'), async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: "No file upload" })
    }

    const uuid = req.auth.id; 
    const cell = parseInt(req.body.index, 10);

    const metadata = {
        filename: file.originalname,
        file_type: file.mimetype,
        bytes: file.size,
        cell: cell,
    }

    const result = await FileManagerService.register_file(uuid, metadata)
    if (result.success && result.data) {
        return res.status(200).json(result.data)
    }
    else {
        console.log(result)
        return res.status(400).json({})
    }
})

app.post('/api/desktop/swap', requireAuth, async (req: Request, res: Response) => {
    const uuid = req.auth.id;

    const { first, second } = req.body;

    const result = await FileManagerService.swap_items(first, second, uuid);
    console.log(result)
    if (result.success) {
        return res.status(200).json({});
    }

    return res.status(400).json({});
})

app.get('/api/desktop', requireAuth, async (req: Request, res: Response) => {
    const uuid = req.auth.id; 
    console.log(uuid)
    const items = await FileManagerService.getUserDesktop(uuid);
    if (!items) {
        res.status(400).json({})
    }

    res.status(200).json(items)


})

app.post("/api/db", async (req: Request, res: Response) => {
    console.log("All avalible users: ", await DBService.get_users());
    console.log(await DBService.register_user(req));
})

app.listen(port as number, "127.0.0.1", () => {
    console.log(`Server is running at http://127.0.0.1:${port}`);
});
