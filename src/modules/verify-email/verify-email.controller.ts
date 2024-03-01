import { Response, Request } from "express";
import { VerifyEmailUseCase } from "./verify-email.usecase";

export class VerifyEmailController{
    constructor(){}

    handle(response: Response, request: Request) {
        const useCase = new VerifyEmailUseCase()
        useCase.execute(response, request)
    }
}