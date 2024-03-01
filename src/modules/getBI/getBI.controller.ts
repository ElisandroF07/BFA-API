import { Request, Response } from "express";
import { GetBIUseCase } from "./getBI.usecase";

export class GetBICOntroller{
    
    constructor(){}

    handle(request: Request, response: Response, data: any) {
        const useCase = new GetBIUseCase()
        useCase.execute(request, response)
    }
}