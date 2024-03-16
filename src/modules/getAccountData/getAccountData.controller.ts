import { Request, Response } from "express";
import { GetAccountDataUseCase } from "./getAccountData.usecase";

export class GetAccountDataController{
  handle(request: Request, response: Response){
    const useCase = new GetAccountDataUseCase()
    useCase.execute(request, response)
  }
}