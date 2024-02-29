
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Request, Response } from "express";
const prismaClient = new PrismaClient()

interface IProps{
    name: string[],
    email: string,
    biNumber: string,
    phone: number
}

export class PersonalDataUseCase {

    constructor(){}

    async uploadData(data: IProps, response: Response){
        const {phone, email, name, biNumber} = data
        const body = JSON.stringify({
            affairsReceipt: biNumber,
            affairsType: "IDCard",
            captchaValue: ""
        })

        try {
            const res = await axios.post(`https://bi-bs.minjusdh.gov.ao/pims-backend/api/v1/progress`, body, {headers: {"Content-Type": "application/json"}})

            if(res.data.affairsProgressState !== 'Activate'){
                return response.status(403).json({message: 'BI não cadastrado nos Serviços de Identificação!'})
            }

            const client = await prismaClient.client_phones.findFirst({
                where: {
                    phone_number: parseInt('244'+phone)
                },
                select: {
                    client_id: true
                }
            })

            if(!client){
                return response.status(404).json({message: 'Cliente não encontrado!'})
            }

            await prismaClient.client_email.create({
                data: {
                    email_address: email,
                    role_id: 1,
                    verified: false,
                    client_id: client.client_id
                }
            })

            await prismaClient.client.updateMany({
                where: {
                    client_id: client.client_id
                },
                data: {
                    personal_data: {
                        name: name,
                    },
                    address: {
                        country: 'Angola',
                        province: '',
                    },
                    bi_number: biNumber
                }
            })

            return response.status(201).json({message: 'Dados enviados com sucesso!'})
        } catch (error) {
            console.error(error)
            return response.status(500).json({message: 'Ocorreu um erro ao processar a solicitação!'})
        }
    }

    async execute(data: IProps, request: Request, response: Response){
        await this.uploadData(data, response)
    }
}
