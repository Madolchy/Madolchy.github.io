import { meta } from 'zod/v4/core';
import { prisma } from '../client/prisma.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { DesktopIconUncheckedCreateInputSchema } from '../generated/zod/index.js';
import z from 'zod';


const UploadPayloadSchema = z.object({
    filename: z.string(),
    file_type: z.string(),
    bytes: z.number().int(),
    cell: z.number().int(),
});


const cellSchema = z.number().int().min(0).max(255);


export const FileManagerService = {
    register_file: async (uuid, metadata) => {
        const validData = UploadPayloadSchema.safeParse(metadata);
        if (!validData.success) {
            return { success: false, message: "Got a invalid metadata" }
        }

        const data = validData.data;

        try {
            const result = await prisma.desktopIcon.create({
                data: {
                    ...data,
                    user: {
                        connect: {
                            uuid: uuid
                        }
                    }
                }
            })
            return { success: true, data: result}
            
        }
        catch (e) {
            return { success: false, message: "Failed to create the desktop icon", error: e }
        }

    },

    getUserDesktop: async (uuid) => {
        try {
            const icons = await prisma.desktopIcon.findMany({
                where: {
                    user: {
                        uuid: uuid
                    }
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
            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUniqueOrThrow({
                    where: { uuid: userUuid },
                    select: { id: true }
                });
                const userId = user.id;

                const icon1 = await tx.desktopIcon.findUnique({
                    where: { userId_cell: { userId, cell: firstCell } }
                });
                const icon2 = await tx.desktopIcon.findUnique({
                    where: { userId_cell: { userId, cell: secondCell } }
                });

                if (!icon1) {
                    throw new Error("Source icon does not exist.");
                }

                if (!icon2) {
                    await tx.desktopIcon.update({
                        where: { id: icon1.id },
                        data: { cell: secondCell }
                    });
                } else {
                    const tempCell = -Math.floor(Math.random() * 1000000) - 1;

                    await tx.desktopIcon.update({
                        where: { id: icon1.id },
                        data: { cell: tempCell }
                    });

                    await tx.desktopIcon.update({
                        where: { id: icon2.id },
                        data: { cell: firstCell } // Use firstCell directly
                    });

                    await tx.desktopIcon.update({
                        where: { id: icon1.id },
                        data: { cell: secondCell } // Use secondCell directly
                    });
                }
            });

            return { success: true, data: {}};

        } catch (error) {
            console.error("Move/Swap transaction failed:", error);
            return { success: false, message: "Failed to update layout." };
        }
    }

}