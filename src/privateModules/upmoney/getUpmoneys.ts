import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetUpMoneysUseCase {

  async get(accountNumber: string, response: Response) {
    try {
      const data = await prismaClient.upmoney.findMany({
        where: { accountFrom: accountNumber },
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
    
      const formattedData = data.map(item => ({
        ...item,
        number: item?.number?.toString(), // Convertendo o number para string
      }));
    
      return response.status(200).json({ success: true, data: formattedData });
    }
    catch(err) {
      console.log(err)
      return response.status(200).json({success: false, data: err})
    }
  }

  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber
    this.get(accountNumber, response)
  }
}