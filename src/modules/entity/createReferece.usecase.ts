import { Request, Response } from "express";

interface IData {
  entityId: number,
  description: string,
  balance: number,
  product: string
}

export class CreateReferenceUseCase {
  async create(data: IData ,response: Response) {
    
  }

  execute(request: Request, response: Response) {
    const data:IData = request.body
    this.create(data, response)
  }
}