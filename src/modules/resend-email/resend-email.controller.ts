import { Response, Request } from "express";
import { ResendEmailUseCase } from "./resend-email.usecase";

export class ResendEmailController{
    constructor(){}

    handle(response: Response, request: Request) {
        const useCase = new ResendEmailUseCase()
        useCase.execute(response, request)
    }
}