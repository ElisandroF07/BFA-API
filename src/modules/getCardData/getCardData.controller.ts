import { Request, Response } from "express";
import { GetCardDataUseCase } from "./getCardData.usecase";

export class GetCardDataController{
  handle(request: Request, response: Response){
    const useCase = new GetCardDataUseCase()
    useCase.execute(request, response)
  }
}