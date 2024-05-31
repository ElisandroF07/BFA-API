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
      const clientTo = await prismaClient.client_email.findFirst({where: {email_address: request?.emailTo || ""}, select: {client: true}, cacheStrategy: { ttl: 1 }})
      
      // Busca o cliente que recebeu a solicitação
      const clientFrom = await prismaClient.client_email.findFirst({where: {email_address: request?.emailFrom || ""}, select: {client: true}, cacheStrategy: { ttl: 1 }})
      
      // Busca a conta do cliente que fez a solicitação
      const accountFrom = await prismaClient.account.findFirst({where: {client_id: clientFrom?.client?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true, account_nbi: true}})
      
      // Busca a conta do cliente que recebeu a solicitação
      const accountTo = await prismaClient.account.findFirst({where: {client_id: clientTo?.client?.client_id || 0}, select: {account_id: true, authorized_balance: true, available_balance: true, account_number: true, account_nbi: true}})
      
      // Atualiza os saldos das contas envolvidas na transação
      await prismaClient.account.update({where: {account_id: accountFrom?.account_id || 0}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") + parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") + parseFloat(request?.balance?.toString() || "")}})
      await prismaClient.account.update({where: {account_id: accountTo?.account_id || 0}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") - parseFloat(request?.balance?.toString() || ""), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") - parseFloat(request?.balance?.toString() || "")}})
      const personalTo:{name: string[], birthDate: string} = clientTo?.client?.personal_data as {name: string[], birthDate: string}
      const personalFrom:{name: string[], birthDate: string} = clientFrom?.client?.personal_data as {name: string[], birthDate: string}
      
      // Deleta a solicitação de dinheiro após a transação ser concluída
      await prismaClient.money_requests.delete({where: { id: data.id }});
      
      // Registra a transferência na tabela de transferências
      await prismaClient.transfers.create({data: {
        balance: request?.balance, 
        date: Date.now().toString(), 
        receptor_description: personalFrom.name.join(' '), 
        emissor_description: personalTo.name.join(' '),
        status: "Finalizada", 
        transfer_description: "Transferência Express", 
        type: 5, 
        accountFrom: accountTo?.account_nbi, 
        accountTo: accountFrom?.account_nbi,
        pre_balance: accountFrom?.available_balance,
        pos_balance: (accountFrom?.available_balance || 0) - (request?.balance || 0)
      }})
      
      // Busca os dados pessoais do cliente que recebeu a solicitação
      // const client = await prismaClient.client.findFirst({where: {client_id: clientTo?.client_id || 0}, select: {personal_data: true}})
    
      await prismaClient.notifications.create({data: {
        tittle: `${personalTo.name[0]} ${personalFrom.name[personalTo.name.length -1]} aceitou a sua solicitação de dinheiro!`,
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
