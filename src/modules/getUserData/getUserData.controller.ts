import { Request, Response } from "express";
import { GetUserDataUseCase } from "./getUserData.usecase";

export class GetUserDataController{
  handle(request: Request, response: Response){
    const useCase = new GetUserDataUseCase()
    useCase.execute(request, response)
  }
}