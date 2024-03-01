import { Request, Response } from "express";
import { VerifyResetUseCase } from "./verify-reset.usecase";

export class VerifyResetController {
    
    constructor(){}

    handle(request: Request, response: Response){
        const useCase = new VerifyResetUseCase()
        useCase.execute(request, response)
    }
}