import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import crypto from 'crypto'
const sendMail = require('../../libs/sendEmail')
const bcrypt = require('bcryptjs')

export class TwoFactorAuthUseCase {

    constructor() {}

    async encrypt(token: string): Promise<string> {
        const salt = await bcrypt.genSalt(12)
        const tokenHash = await bcrypt.hash(token, salt)
        return tokenHash 
    }

    async sendToken(membership_number: string, response: Response){
        try {
            let idC = await prismaCient.client.findFirst({where: {membership_number: membership_number}, select: {client_id: true}})
            let idE = await prismaCient.client_email.findFirst({where: {client_id: idC?.client_id || 0}, select: {email_address: true}})
            if (idC) {
                const token = crypto.randomBytes(32).toString('hex')
                const tokenHash = await this.encrypt(token)
                const url = `${process.env.BASE_URL}/email/${idE?.email_address}/2fa/${token}`
                let client = await prismaCient.client.update({
                    where: {client_id: idC?.client_id || 0},
                    data: {
                        token: tokenHash
                    }
                })
                sendMail(idE?.email_address, "Autenticação de dois fatores", url)
                response.status(201).json({ message:`Email enviado para a sua caixa de entrada.`})
            }
            else {
                response.status(200).json({message: "Número de adesão inválido!"})
            }
        }
        catch{
            response.status(500).json({message: "Erro interno! Tente novamente mais tarde."})
        }
        
    }

    execute(response: Response, request: Request) {
        const membership_number = request.params.membership_number
        this.sendToken(membership_number, response)
    }
}
