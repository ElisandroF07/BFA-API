import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import crypto from 'crypto'
const bcrypt = require('bcryptjs')
const sendMail = require('../../libs/sendEmail')

export class VerifyResetUseCase{

    constructor(){}

    async compareToken(tokenHash: string, token: string){
        let response = await bcrypt.compare(token, tokenHash)
        if (response) {
            return true
        }
        else {
            return false
        }
    }

    async verifyToken(email: string, user_token: string, response: Response){
        let token = await prismaCient.client_email.findFirst({
            where: {
                email_address: email
            },
            select: {
                client_id: true
            }
        })
        let client = await prismaCient.client.findFirst({where: {client_id: token?.client_id || 0}, select: {token: true}})

        if(client) {
            if (client.token === '') {
                return response.redirect('http://localhost:3000/login/error')
            }
            else {
                if (await bcrypt.compare(user_token, client.token || '')){
                    await prismaCient.client.update({
                        where:{client_id: token?.client_id || 0},
                        data: {
                            token: ''
                        }
                    })
                    return response.redirect('http://localhost:3000/forgot-password/credentials')
                }
                else {
                    return response.redirect('http://localhost:3000/login/error')
                }
            }
        }
        else {
            return response.redirect('http://localhost:3000/login/error')
        }
    }

    async execute(request: Request, response: Response){
        const email = request.params.email
        const token  = request.params.token
        await this.verifyToken(email, token, response)
    }

}