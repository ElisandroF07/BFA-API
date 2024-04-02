import { Response, Request } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

interface IData {
  id: number,
  notificationId: string
}

export class RejectMoneyRequestUseCase {

  async reject(data: IData, response: Response) {
    try {
      const request = await prismaClient.money_requests.delete({where: { id: data.id }, select: {emailTo: true, emailFrom: true}});
      const email = await prismaClient.client_email.findFirst({where: {email_address: request.emailTo || ""}, select: {client_id: true}})
      const client = await prismaClient.client.findFirst({where: {client_id: email?.client_id || 0}, select: {personal_data: true}})
      const body = {
        tittle: `${request.emailTo} rejeitou a sua solicitação de dinheiro.`,
        email: request.emailFrom,
        type: 1
      }
      const res = await axios.post(`${process.env.BASE_URL}/createNotification`, body)
      if (res.data.success) {
        const rp = await axios.get(`${process.env.BASE_URL}/deleteNotification/${data.notificationId}`)
        if (rp.data.success) {
          return response.status(201).json({success: true ,message: "Operação concluida com sucesso!"})
        }
        return response.status(400).json({success: false ,message: "Operação não concuida!"})
      }
      return response.status(400).json({success: false ,message: "Operação não concuida!"})
  }
  catch(err) {

    return response.status(200).json({success: err, message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
  }
}

  execute(request: Request, response: Response) {
    const { id, notificationId } = request.params;
    const data: IData = {
      id: parseInt(id),
      notificationId
    }
    this.reject(data, response)
  }
}