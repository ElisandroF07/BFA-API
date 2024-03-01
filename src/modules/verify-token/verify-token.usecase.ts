import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
const bcrypt = require('bcryptjs')

export class VerifyTokenUseCase {

    constructor() {}    

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
                token: true,
                verified: true,
                email_id: true
            }
        })

        if(token) {
            if (token.verified) {
                return response.redirect('http://localhost:3000/email/error')
            }
            else {
                if (await bcrypt.compare(user_token, token.token || '')){
                    await prismaCient.client_email.update({
                        where:{email_id: token.email_id},
                        data: {
                            verified: true,
                            token: ''
                        }
                    })
                    return response.redirect('http://localhost:3000/email/verified')
                }
                else {
                    return response.redirect('http://localhost:3000/email/error')
                }
            }
        }
        else {
            return response.redirect('http://localhost:3000/email/error')
        }
    }

    execute(response: Response, request: Request) {
        const email = request.params.email
        const token  = request.params.token
        this.verifyToken(email, token, response)
    }
}
