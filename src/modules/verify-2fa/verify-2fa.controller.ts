import { Response, Request } from "express";
import { Verify2FAUseCase } from "./verify-2fa.usecase";

export class Verify2FAController{
    constructor(){}

    handle(response: Response, request: Request) {
        const useCase = new Verify2FAUseCase()
        useCase.execute(response, request)
    }
}