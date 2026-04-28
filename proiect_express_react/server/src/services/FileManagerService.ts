import { meta } from 'zod/v4/core';
import { prisma } from '../client/prisma.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { DesktopIconUncheckedCreateInputSchema } from '../generated/zod/index.js';
import z from 'zod';


const UploadPayloadSchema = z.object({
    id: z.string().optional(),
    filename: z.string(),
    fileType: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
});


const cellSchema = z.number().int().min(0).max(255);


export const FileManagerService = {
    register_file: async (uuid, metadata) => {
        console.log(metadata)
        const validData = UploadPayloadSchema.safeParse(metadata);
        if (!validData.success) {
            return { success: false, message: "Got a invalid metadata" }
        }

        const data = validData.data;

        try {
            const user = await prisma.user.findUnique({
                where: { uuid: uuid },
                select: { id: true }
            });
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const result = await prisma.desktopIcon.create({
                data: {
                    id: data.id,
                    filename: data.filename,
                    fileType: data.fileType,
                    bytes: data.bytes,
                    cell: data.cell,
                    userId: user.id
                }
            })
            return { success: true, data: result }

        }
        catch (e) {
            return { success: false, message: "Failed to create the desktop icon", error: e }
        }

    },

    getUserDesktop: async (uuid) => {
        try {
            const user = await prisma.user.findUnique({
                where: { uuid: uuid },
                select: { id: true }
            });
            if (!user) return [];

            const icons = await prisma.desktopIcon.findMany({
                where: {
                    userId: user.id
                }
            })

            return icons
        }
        catch (error) {
            console.error("Error fetching: ", error)
            return undefined
        }

    },


    swap_items: async (firstCellPayload, secondCellPayload, userUuid) => {
        const [validFirst, validSecond] = [
            cellSchema.safeParse(firstCellPayload),
            cellSchema.safeParse(secondCellPayload)
        ];

        if (!validFirst.success || !validSecond.success) {
            return { success: false, message: "Invalid cell data provided" };
        }

        const firstCell = validFirst.data;
        const secondCell = validSecond.data;

        try {
            const user = await prisma.user.findUnique({
                where: { uuid: userUuid },
                select: { id: true }
            });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            const userId = user.id;

            const icon1 = await prisma.desktopIcon.findFirst({
                where: { userId: userId, cell: firstCell }
            });
            const icon2 = await prisma.desktopIcon.findFirst({
                where: { userId: userId, cell: secondCell }
            });

            if (!icon1) {
                return { success: false, message: "Source icon does not exist." };
            }

            if (!icon2) {
                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: secondCell }
                });
            } else {
                const tempCell = -Math.floor(Math.random() * 1000000) - 1;

                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: tempCell }
                });

                await prisma.desktopIcon.update({
                    where: { id: icon2.id },
                    data: { cell: firstCell }
                });

                await prisma.desktopIcon.update({
                    where: { id: icon1.id },
                    data: { cell: secondCell }
                });
            }

            return { success: true, data: {} };

        } catch (error) {
            console.error("Move/Swap transaction failed:", error);
            return { success: false, message: "Failed to update layout." };
        }
    }

}