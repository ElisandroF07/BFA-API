import { Response, Request } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

interface IData {
  id: number,
  notificationId: string
}

export class AcceptMoneyRequestUseCase {

  async accept(data: IData, response: Response) {
    try {
      const request = await prismaClient.money_requests.findFirst({where: {id: data.id}, select: {balance: true, date: true, emailFrom: true, emailTo: true, status: true}})
      const clientTo = await prismaClient.client_email.findFirst({where: {email_address: request?.emailTo || ""}, select: {client_id: true}})
      const clientFrom = await prismaClient.client_email.findFirst({where: {email_address: request?.emailFrom || ""}, select: {client_id: true}})
      const accountFrom = await prismaClient.account.findFirst({where: {client_id: clientFrom?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true}})
      const accountTo = await prismaClient.account.findFirst({where: {client_id: clientTo?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true}})
      await prismaClient.account.update({where: {account_id: accountFrom?.account_id || 0}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") + parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") + parseFloat(request?.balance?.toString() || "")}})
      await prismaClient.account.update({where: {account_id: accountTo?.account_id || 0}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") - parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") - parseFloat(request?.balance?.toString() || "")}})
      await prismaClient.money_requests.delete({where: { id: data.id }});
      await prismaClient.transfers.create({data: {balance: request?.balance, date: Date.now().toString(), receptor_description: request?.emailFrom, status: "Finalizada", transfer_description: "Transferência Instantânia por Solicitação", type: 5, accountFrom: accountTo?.account_number, accountTo: accountFrom?.account_number}})
      const client = await prismaClient.client.findFirst({where: {client_id: clientTo?.client_id || 0}, select: {personal_data: true}})
      const body = {
        tittle: `${request?.emailTo} aceitou a sua solicitação de dinheiro.`,
        email: request?.emailFrom,
        type: 1
      }
      const resp = await axios.post(`${process.env.BASE_URL}/createNotification`, body)
      if (resp.data.success) {
        const rp = await axios.get(`${process.env.BASE_URL}/deleteNotification/${data.notificationId}`)
        if (rp.data.success) {
          return response.status(201).json({success: true ,message: "Operação concluida com sucesso!"})
        }
        return response.status(400).json({success: false ,message: "Operação não concuida!"})
      }
      return response.status(201).json({success: true ,message: "Operação concluida com sucesso!"})
  }
  catch {
    return response.status(200).json({success: false, message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
  }
}

  execute(request: Request, response: Response) {
    const { id, notificationId } = request.params;
    const data: IData = {
      id: parseInt(id),
      notificationId
    }
    this.accept(data, response)
  }
}