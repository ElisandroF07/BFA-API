import { GenerateCredentialsUseCase } from "./generateCredential.usecase";
import { Request, Response} from 'express'
export class GenerateCredentialsController{
    
    constructor(){}

    handle(request: Request, response: Response){
        const useCase = new GenerateCredentialsUseCase()
        useCase.execute(request, response)
    }
}