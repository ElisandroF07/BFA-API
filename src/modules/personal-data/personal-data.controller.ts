import { Request, Response } from "express";
import { PersonalDataUseCase } from "./personal-data.usecase";

interface IProps{
    name: string[],
    email: string,
    biNumber: string,
    phone: number
}

export class PersonalDataController {
    constructor(){}

    async handle(data: IProps, request: Request, response: Response){
        const useCase = new PersonalDataUseCase()
        useCase.execute(data, request, response)
    }
}