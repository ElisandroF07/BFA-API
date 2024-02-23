import {Request, Response} from 'express'
import { VerifyPhoneUseCase } from './verify-phone.usecase'

export class VerifyPhoneController {

    constructor(){}

    async handle(request: Request, response: Response, phone: number) {

        const useCase = new VerifyPhoneUseCase
        
        try {
            let complete_phone = '244' + phone
            const result = await useCase.execute(parseInt(complete_phone), response)
            return result
        }
        catch(err) {
            return response.status(400).json(err)
        }

    }
}