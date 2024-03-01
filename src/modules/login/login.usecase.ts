import { Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

export class LoginUseCase{

    constructor(){}

    async login(membership: string, access_code: string, response: Response){
        let client = await prismaCient.client.findFirst({
            where: {
                membership_number: membership
            },
            select: {
                access_code: true,
                client_id: true,
                membership_number: true,
                bi_number: true,
                personal_data: true,
                professional_data: true,
                address: true,
                role_id: true
            }
        })
        if (client) {
            console.log(client);
            
            if (await bcrypt.compare(access_code, client.access_code)) {
                const secret = process.env.SECRET
                return response.status(201).json({message: 'Sucesso!'})
            } else {
                return response.status(200).json({message: "Código de acesso incorreto!"})
            }
        }
        else {
            return response.status(200).json({message: "Número de adesão não encontrado!"})
        }
    }

    async execute(data: any, response: Response) {
        let {membership_number, access_code} = data
        await this.login(membership_number, access_code, response)
    }
}
