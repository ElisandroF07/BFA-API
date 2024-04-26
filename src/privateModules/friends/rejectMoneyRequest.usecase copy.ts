import { Response, Request } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

// Interface para os dados necessários para rejeitar uma solicitação de dinheiro
interface IData {
  id: number, // ID da solicitação de dinheiro
  notificationId: string // ID da notificação relacionada à solicitação
}

// Classe responsável por lidar com a rejeição de solicitações de dinheiro
export class RejectMoneyRequestUseCase {

  // Método assíncrono para rejeitar uma solicitação de dinheiro
  async reject(data: IData, response: Response) {
    try {
      // Deleta a solicitação de dinheiro
      const request = await prismaClient.money_requests.delete({where: { id: data.id }, select: {emailTo: true, emailFrom: true}});
      
      // Encontra o e-mail do destinatário da solicitação de dinheiro
      const email = await prismaClient.client_email.findFirst({where: {email_address: request.emailTo || ""}, select: {client_id: true}})
      
      // Encontra os dados pessoais do destinatário da solicitação de dinheiro
      const client = await prismaClient.client.findFirst({where: {client_id: email?.client_id || 0}, select: {personal_data: true}})
      
      // Cria uma notificação informando que a solicitação foi rejeitada
      const body = {
        tittle: `${request.emailTo} rejeitou a sua solicitação de dinheiro.`,
        email: request.emailFrom,
        type: 1
      }
      const res = await axios.post(`${process.env.BASE_URL}/createNotification`, body)
      if (res.data.success) {
        // Se a notificação for criada com sucesso, exclui a notificação relacionada à solicitação
        const rp = await axios.get(`${process.env.BASE_URL}/deleteNotification/${data.notificationId}`)
        if (rp.data.success) {
          return response.status(201).json({success: true ,message: "Operação concluida com sucesso!"})
        }
        return response.status(400).json({success: false ,message: "Operação não concluida!"})
      }
      return response.status(400).json({success: false ,message: "Operação não concluida!"})
    }
    catch(err) {
      // Se ocorrer um erro, retorna uma mensagem de erro
      return response.status(200).json({success: err, message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
    }
  }

  // Método para executar a rejeição de solicitação de dinheiro a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const { id, notificationId } = request.params;
    const data: IData = {
      id: parseInt(id),
      notificationId
    }
    this.reject(data, response)
  }
}
