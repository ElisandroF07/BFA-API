import { Response, Request } from "express";
import { TwoFactorAuthUseCase } from "./2fa.usecase";

export class TwoFactorAuthController{
    constructor(){}

    handle(response: Response, request: Request) {
        const useCase = new TwoFactorAuthUseCase()
        useCase.execute(response, request)
    }
}