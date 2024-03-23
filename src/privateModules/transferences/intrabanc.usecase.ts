import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

type bodyData = {
  balance: string, 
  accountFrom: string,
  accountTo: string,
  receptor_description: string,
  tranfer_description: string
}

export class TransferIntrabancUseCase{
  
  async transfer(data: bodyData, response: Response) {
    const accountFrom = await prismaClient.account.findFirst({where: {account_number: data.accountFrom}, select: {authorized_balance: true, available_balance: true, account_id: true}})
    if (parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat(data.balance) < 0) {
      return response.status(200).json({message: "Saldo insuficiênte."})
    }
    try {
      const accountTo = await prismaClient.account.findFirst({where: {account_number: data.accountTo}, select: {authorized_balance: true, available_balance: true, account_id: true}})
      await prismaClient.account.update(({where: {account_id: accountTo?.account_id}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") + parseFloat((data.balance))}}))
      await prismaClient.account.update(({where: {account_id: accountFrom?.account_id}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance))}}))
      await prismaClient.transfers.create({data: {type: 1, accountFrom: data.accountFrom, accountTo: data.accountTo, balance: data.balance, transfer_description: data.tranfer_description, receptor_description: data.receptor_description, date: Date.now().toString(), status: "Finalizada"}})
      return response.status(201).json({message: "Operação concluida com sucesso!"})
    }
    catch {
      return response.status(200).json({message: "Ocorreu um erro ao processar a sua solitação! Tente novamente mais tarde."})
    }
  }
  
  execute(request: Request, response: Response) {
    const data:bodyData = request.body
    this.transfer(data, response)
  }
}