import { Request, Response } from "express";
import { LoginUseCase } from "./login.usecase";

export class LoginController{

    constructor(){}

    handle(data: Request, response: Response){
        const useCase = new LoginUseCase()
        useCase.execute(data, response)
    }

}