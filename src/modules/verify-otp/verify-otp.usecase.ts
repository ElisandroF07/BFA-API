import { PrismaClient } from "@prisma/client";
import { Response } from "express";
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prismaClient = new PrismaClient()

export class VerifyOTPUseCase{
    constructor(){}

    async createPhone(phone_requester: number, OTP: string, response: Response){
        let phone = await prismaClient.register_requests.findFirst({where: {phone_number: phone_requester},select: {otp_code: true}})

        if (phone) {
            let result = await bcrypt.compare(OTP, phone.otp_code)
            if (result) {
                const pn = await prismaClient.client_phones.findFirst({where:{phone_number: phone_requester}})
                if (pn) {
                    try{
                        await prismaClient.client_phones.updateMany({
                            where: {phone_number: phone_requester},
                            data: {
                                verified: true,
                            }
                        }).then()
                    }
                    catch(err){
                        return response.status(500).json({err})
                    }
                }
                else {
                    console.log('no try')
                    
                        const client = await prismaClient.client.create({
                            data: {
                                role_id: 1,
                            }
                        })
                        console.log('passei o try')
                        await prismaClient.client_phones.create({
                            data: {
                                phone_number: phone_requester,
                                verified: true,
                                role_id: 1,
                                client_id: client.client_id
                            }
                        })
                    
                    
                }

                try {
                    await prismaClient.register_requests.deleteMany({
                        where:{
                            phone_number: phone_requester
                        }
                    }).then()
                }
                catch(err) {
                    return response.status(500).json({err})
                }
                return response.status(201).json({message: 'Telefone verificado com sucesso!'})
            }
            else {
                return response.status(401).json({message: "Código de verificação inválido!"})
            }
        }
        else {
            return response.status(400).json({message: "Telefone inválido ou já verificado!"})
        } 
    }

    execute(phone: number, OTP: string, response: Response){
        this.createPhone(phone, OTP, response)
    }
}