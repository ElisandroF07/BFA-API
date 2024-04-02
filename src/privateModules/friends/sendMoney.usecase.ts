import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData {
  balance: string,
  email: string,
  accountNumber: string
}

export class SendMoneyUseCase{

  async send(data: IData, response: Response) {
    try {
      const client_email = await prismaClient.client_email.findFirst({where: {email_address: data.email}, select: {client_id: true}})
      const accountFrom = await prismaClient.account.findFirst({where: {account_number: data.accountNumber}, select: {account_id: true, authorized_balance: true, available_balance: true}})
      const account = await prismaClient.account.findFirst({where: {client_id: client_email?.client_id || 0}, select: {account_id: true, account_number: true, authorized_balance: true, available_balance: true}})
      if (parseFloat((account?.authorized_balance || "").toString()) - parseFloat(data.balance) < 0) {
        return response.status(200).json({success: false, message: "Saldo insuficiente!"})
      }
      await prismaClient.account.update(({where: {account_id: account?.account_id}, data: {authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(account?.available_balance?.toString() || "") + parseFloat((data.balance))}}))
      await prismaClient.account.update(({where: {account_id: accountFrom?.account_id}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance))}}))
      await prismaClient.transfers.create({data: {type: 5, accountFrom: data.accountNumber, accountTo: account?.account_number, balance: data.balance, transfer_description: "Transferência instantânea", receptor_description: data.email, date: Date.now().toString(), status: "Finalizada"}})
      return response.status(201).json({success: true, message: "Operação concluida com sucesso!"})
    }
    catch(err) {
      console.log(err)
      return response.status(200).json({success: false, message: "Ocorreu um erro ao processar a sua solitação! Tente novamente mais tarde."})
    }
  }

  execute(request: Request, response: Response) {
    const data:IData = request.body;
    this.send(data, response);
  }

}