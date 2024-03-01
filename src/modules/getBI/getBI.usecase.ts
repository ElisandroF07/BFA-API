import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import { parse } from "date-fns";

export class GetBIUseCase{ 
    constructor(){}

    async getBi(request: Request, response: Response, email: string){
        const client_email = await prismaCient.client_email.findFirst({
            where: {
                email_address: email
            },
            select: {
                client_id: true
            }
        })
        const client = await prismaCient.client.findFirst({
            where: {
                client_id: client_email?.client_id || 0
            },
            select: {
                bi_number: true
            }
        })
        return response.status(200).json({biNumber: client?.bi_number})
    }

    async execute(request: Request, response: Response){
        const email = request.params.email
        await this.getBi(request, response, email)
    }
}