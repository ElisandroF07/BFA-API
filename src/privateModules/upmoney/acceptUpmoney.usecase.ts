import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class AcceptUpmoney{

  async accept(transactionId: number, response: Response) {
    try {
      const upmoney = await prismaClient.upmoney.findFirst({where: {transferId: transactionId}, select: {id: true, accountFrom: true, balance: true}})
      if (!upmoney) {
        return response.status(200).json({success: false, message: "Id da transação inválido!"})
      }
      const account = await prismaClient.account.findFirst({where: {account_number: upmoney.accountFrom || ""}, select: {account_id: true, authorized_balance: true}})
      await prismaClient.transfers.update({where: {id: transactionId}, data: {
        status: "Finalizado"
      }})
      return response.status(200).json({success: true, message: "Operação aceite com sucesso!"})
    }
    catch {
      return response.status(500).json({success: false, message: "Occorreu um erro ao processar sua solicitação!"})
    }
  }

  execute(request: Request, response: Response) {
    const transactionId:number = parseInt(request.params.transactionId)
    this.accept(transactionId, response)
  }
}