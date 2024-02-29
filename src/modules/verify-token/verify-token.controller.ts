import { Response, Request } from "express";
import { VerifyTokenUseCase } from "./verify-token.usecase";

export class VerifyTokenController{
    constructor(){}

    handle(response: Response, request: Request) {
        const useCase = new VerifyTokenUseCase()
        useCase.execute(response, request)
    }
}