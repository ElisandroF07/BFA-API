import { Request, Response } from "express";
import { VerifyOTPUseCase } from "./verify-otp.usecase";
require('dotenv').config()
const countryCode = process.env.COUNTRY_CODE

export class VerifyOTPController{
    
    constructor(){}

    async handle(request: Request, response: Response, phone: number, otp_code: string) {
        const useCase = new VerifyOTPUseCase
        let complete_phone = '244' + phone
        try {
            const result = await useCase.execute(parseInt(complete_phone), otp_code, response)
            return result
        }
        catch(err) {
            return err
        }
    }
}