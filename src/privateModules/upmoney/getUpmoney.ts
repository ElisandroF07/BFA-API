import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetUpMoneyUseCase {

  async get(id: number, response: Response) {
    try {
      const data = await prismaClient.upmoney.findFirst({
        where: { id: id },
        select: {
          accountFrom: true,
          balance: true,
          date: true,
          id: true,
          number: true,
          status: true,
          transferId: true,
        },
      });
      
      return response.status(200).json({ success: true, upmoney: {
           accountFrom: data?.accountFrom,
          balance: data?.balance,
          date: data?.date,
          id: data?.id,
          number: data?.number?.toString(),
          status: data?.status,
          transferId: data?.transferId,
        } 
      });

    }
    catch(err) {
      console.log(err)
      return response.status(200).json({success: false, data: err})
    }
  }

  execute(request: Request, response: Response) {
    const id = request.params.id
    this.get(parseInt(id), response)
  }
}