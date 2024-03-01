import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import crypto from 'crypto'
const bcrypt = require('bcryptjs')
const sendMail = require('../../libs/sendEmail')

export class ResetPasswordUseCase{

    constructor(){}

    async encrypt(token: string): Promise<string> {
        const salt = await bcrypt.genSalt(12)
        const tokenHash = await bcrypt.hash(token, salt)
        return tokenHash 
    }

    async resetPassword(email: string, response: Response) {
        try {
            let client_email = await prismaCient.client_email.findFirst({where: {email_address: email}, select: {client_id: true}})
            if (client_email) {
                const token = crypto.randomBytes(32).toString('hex')
                const tokenHash = await this.encrypt(token)
                const url = `${process.env.BASE_URL}/email/${email}/resetPassword/${token}`
                let client = await prismaCient.client.update({
                    where: {client_id: client_email?.client_id || 0},
                    data: {
                        token: tokenHash
                    }
                })
                sendMail(email, "Redefinição de credenciais", url)
                response.status(201).json({ message:`Email enviado para a sua caixa de entrada.`})
            }
            else {
                response.status(200).json({message: 'Este email não está associado à uma conta!'})
            }
        }
        catch{
            response.status(500).json({message: "Erro interno! Tente novamente mais tarde."})
        }
    }

    async execute(request: Request, response: Response){
        const email = request.params.email
        await this.resetPassword(email, response)
    }

}