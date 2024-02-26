import { Request, Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
import { parse } from "date-fns";

export class GetBIUseCase{ 
    constructor(){}

    async getBi(request: Request, response: Response, phone_requester: number){
        const phone = await prismaCient.client_phones.findFirst({
            where: {
                phone_number: phone_requester
            },
            select: {
                client_id: true
            }
        })
        const client = await prismaCient.client.findFirst({
            where: {
                client_id: phone?.client_id || 0
            },
            select: {
                bi_number: true
            }
        })
        return response.status(200).json({biNumber: client?.bi_number})
    }

    async execute(request: Request, response: Response){
        const phone = parseInt('244'+request.params.phone)
        await this.getBi(request, response, phone)
    }
}