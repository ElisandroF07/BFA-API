import { Request, Response } from "express";
import { PersonalDataUseCase } from "./personal-data.usecase";

export class PersonalDataController {
    constructor(){}

    async handle(data: any, response: Response){
        const useCase = new PersonalDataUseCase()
        useCase.execute(data, response)
    }
}