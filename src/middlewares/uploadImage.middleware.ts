import { PrismaClient } from "@prisma/client"
import { Request } from "express"
import { prismaCient } from "../infra/database/prismaClient"
const primaClient = new PrismaClient()

const multer = require('multer')

module.exports = (multer({
    storage: multer.diskStorage({
        destination: async (req: Request, file: any, cb: any) => {
            if (req.params.imageRole === 'BI_FRENTE') {
                cb(null, '../public/upload/bi/frente')
            }
            else if (req.params.imageRole === 'BI_VERSO') {
                cb(null, '../public/upload/bi/verso')
            }
            else if (req.params.imageRole === 'SELFIE') {
                cb(null, '../public/upload/selfie/normal')
            }
            else if (req.params.imageRole === 'SELFIE_BI') {
                cb(null, '../public/upload/selfie/selfie_bi')
            }
            const phone = req.params.phone
            const client = await prismaCient.client_phones.findFirst({
                where: {
                    phone_number: parseInt('244'+phone)
                },
                select: {
                    client_id: true
                }
            })
            if (req.params.imageRole === 'BI_FRENTE') {
                await prismaCient.client_images.create({
                    data: {
                        image_role: 1,
                        path: `../public/upload/bi/frente/BI_FRENTE_${client?.client_id}`,
                        client_id: client?.client_id
                    }
                });
            }
            else if (req.params.imageRole === 'BI_VERSO') {
                await prismaCient.client_images.create({
                    data: {
                        image_role: 2,
                        path: `../public/upload/bi/verso/BI_VERSO_${client?.client_id}`,
                        client_id: client?.client_id
                    }
                });
            }
            else if (req.params.imageRole === 'SELFIE') {
                await prismaCient.client_images.create({
                    data: {
                        image_role: 3,
                        path: `../public/upload/selfie/normal/SELFIE_${client?.client_id}`,
                        client_id: client?.client_id
                    }
                });
            }
            else if (req.params.imageRole === 'SELFIE_BI') {
                await prismaCient.client_images.create({
                    data: {
                        image_role: 4,
                        path: `../public/upload/selfie/selfie_bi/SELFIE_BI_${client?.client_id}`,
                        client_id: client?.client_id
                    }
                });
            }
            
        },
        filename: async(req: Request, file: any, cb: any) => {
            const phone = req.params.phone
            const client = await prismaCient.client_phones.findFirst({
                where: {
                    phone_number: parseInt('244'+phone)
                },
                select: {
                    client_id: true
                }
            })
            if (req.params.imageRole === 'BI_FRENTE') {
                cb(null, "BI_FRENTE_" + client?.client_id)
            }
            else if (req.params.imageRole === 'BI_VERSO') {
                cb(null, "BI_VERSO_" + client?.client_id)
            }
            else if (req.params.imageRole === 'SELFIE') {
                cb(null, "SELFIE_" + client?.client_id)
            }
            else if (req.params.imageRole === 'SELFIE_BI') {
                cb(null, "SELFIE_BI_" + client?.client_id)
            }
            
        }
    }),
    fileFilter: (req: Request, file: any, cb: any) => {
        const extensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].find(acceptedFormat => acceptedFormat == file.mimetype)
        if (extensions) {
            return cb(null, true)
        }
        return cb(null, false)
    }
}))