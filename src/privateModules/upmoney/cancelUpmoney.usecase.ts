import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class CancelUpmoneyUseCase{

  async cancel(transactionId: number, response: Response) {
    try {
      const upmoney = await prismaClient.upmoney.findFirst({where: {transferId: transactionId}, select: {id: true, accountFrom: true, balance: true}})
      if (!upmoney) {
        return response.status(200).json({success: false, message: "Id da transação inválido!"})
      }
      const account = await prismaClient.account.findFirst({where: {account_number: upmoney.accountFrom || ""}, select: {account_id: true, authorized_balance: true, up_balance: true}})
      const balance = await prismaClient.account.update({where: {account_id: account?.account_id}, data: {
        authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") + parseFloat(upmoney?.balance?.toString() || ""),
        up_balance: parseFloat(account?.up_balance?.toString() || "") - parseFloat(upmoney?.balance?.toString() || "")
      }, select: {authorized_balance: true, available_balance: true, up_balance: true}})
      await prismaClient.upmoney.update({where: {id: upmoney.id}, data: {
        status: 3
      }})
      await prismaClient.transfers.update({where: {id: transactionId}, data: {
        status: "Cancelado"
      }})
      const upmoneys =  await prismaClient.upmoney.findMany({
        where: { accountFrom: upmoney.accountFrom },
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

      const upmoneyList = upmoneys.map(item => ({
        ...item,
        number: item?.number?.toString(), // Convertendo o number para string
      }));

      return response.status(200).json({success: true, message: "Operação cancelada com sucesso!", upmoneyList, balance: {authorized_balance: balance.authorized_balance, available_balance: balance.available_balance, up_balance: balance.up_balance}})
    }

    catch(err) {
      console.log(err)
      return response.status(500).json({success: false, message: err})
    }
  }

  execute(request: Request, response: Response) {
    const transactionId:number = parseInt(request.params.transactionId)
    this.cancel(transactionId, response)
  }
}