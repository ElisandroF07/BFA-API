import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import crypto from 'crypto'
const sendMail = require('../../libs/sendEmail')
const bcrypt = require('bcryptjs')

export class ResendEmailUseCase {

    constructor() {}

    async encrypt(token: string): Promise<string> {
        const salt = await bcrypt.genSalt(12)
        const tokenHash = await bcrypt.hash(token, salt)
        return tokenHash 
    }

    async sendToken(email: string, response: Response){

        const res = await prismaCient.client_email.findFirst({
            where: { email_address: email },
            select:{ verified: true, email_id: true, token: true }
        })
        if (res) {
            if (res.verified) {
                return response.status(422).json({message: 'O email já foi verificado!'})
            }
            else {
                try{
                    const token = crypto.randomBytes(32).toString('hex')
                    const tokenHash = await this.encrypt(token)
                    await prismaCient.client_email.update({
                        where: {email_id: res.email_id},
                        data: {
                            token: tokenHash
                        }
                    })
                    const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`
                    await sendMail(email, "Confirmar Email", url)
                    response.status(201).json({ message:`Email reenviado para o endereço: ${email}`})
                }
                catch {
                    return response.status(500).json({message: 'Erro interno! Tente mais tarde.'})
                }
            }
        }
        else {
            return response.status(400).json({message: 'Endereço de email inválido!'})
        }

        
    }

    execute(response: Response, request: Request) {
        const email = request.params.email
        this.sendToken(email, response)
    }
}