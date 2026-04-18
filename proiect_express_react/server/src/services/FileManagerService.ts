import { meta } from 'zod/v4/core';
import { prisma } from '../client/prisma.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { DesktopIconUncheckedCreateInputSchema } from '../generated/zod/index.js';



export const FileManagerService = {
    register_file: async (uuid, metadata) => {
        const validData = DesktopIconUncheckedCreateInputSchema.safeParse(metadata);
        if (!validData.success) {
            return {success: false, message: "Got a invalid metadata"}
        }        

        const data = validData.data;

        try {
            await prisma.desktopIcon.create({
                data: {
                    filename: data.filename,
                    bytes: data.bytes,
                    cell: data.cell,
                    user: {
                        connect: {
                            uuid:uuid
                        }
                    }
                }
            })
        }
        catch (e) {
            return { success: false, message: "Failed to create the desktop icon", error: e }
        }

        return {success: true}
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
        catch (error){
            console.error("Error fetching: ", error)
            return undefined
        }

    }
}