import { Response, Request } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

// Interface para os dados esperados na requisição
interface IData {
  id: number, // ID da solicitação de dinheiro
  notificationId: string // ID da notificação associada à solicitação
}

export class AcceptMoneyRequestUseCase {

  // Método para aceitar uma solicitação de dinheiro
  async accept(data: IData, response: Response) {
    try {
      // Busca os detalhes da solicitação de dinheiro
      const request = await prismaClient.money_requests.findFirst({where: {id: data.id}, select: {balance: true, date: true, emailFrom: true, emailTo: true, status: true}})
      
      // Busca o cliente que fez a solicitação
      const clientTo = await prismaClient.client_email.findFirst({where: {email_address: request?.emailTo || ""}, select: {client_id: true}})
      
      // Busca o cliente que recebeu a solicitação
      const clientFrom = await prismaClient.client_email.findFirst({where: {email_address: request?.emailFrom || ""}, select: {client_id: true}})
      
      // Busca a conta do cliente que fez a solicitação
      const accountFrom = await prismaClient.account.findFirst({where: {client_id: clientFrom?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true}})
      
      // Busca a conta do cliente que recebeu a solicitação
      const accountTo = await prismaClient.account.findFirst({where: {client_id: clientTo?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true}})
      
      // Atualiza os saldos das contas envolvidas na transação
      await prismaClient.account.update({where: {account_id: accountFrom?.account_id || 0}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") + parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") + parseFloat(request?.balance?.toString() || "")}})
      await prismaClient.account.update({where: {account_id: accountTo?.account_id || 0}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") - parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") - parseFloat(request?.balance?.toString() || "")}})
      
      // Deleta a solicitação de dinheiro após a transação ser concluída
      await prismaClient.money_requests.delete({where: { id: data.id }});
      
      // Registra a transferência na tabela de transferências
      await prismaClient.transfers.create({data: {balance: request?.balance, date: Date.now().toString(), receptor_description: request?.emailFrom, status: "Finalizada", transfer_description: "Transferência Instantânia por Solicitação", type: 5, accountFrom: accountTo?.account_number, accountTo: accountFrom?.account_number}})
      
      // Busca os dados pessoais do cliente que recebeu a solicitação
      // const client = await prismaClient.client.findFirst({where: {client_id: clientTo?.client_id || 0}, select: {personal_data: true}})
    
      await prismaClient.notifications.create({data: {
        tittle: `${request?.emailTo} aceitou a sua solicitação de dinheiro.`,
        email: request?.emailFrom,
        type: 1
      }})
      await prismaClient.notifications.delete({where: {id: parseInt(data.notificationId)}})
      return response.status(201).json({success: true ,message: "Operação concluída com sucesso!"})
    }
    catch(err) {
      console.log(err)
      return response.status(200).json({success: false, message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
    }
  }

  // Executa a aceitação da solicitação de dinheiro
  execute(request: Request, response: Response) {
    // Extrai os IDs da solicitação e da notificação da requisição
    const { id, notificationId } = request.params;
    const data: IData = {
      id: parseInt(id),
      notificationId
    }
    // Chama o método de aceitação
    this.accept(data, response)
  }
}
