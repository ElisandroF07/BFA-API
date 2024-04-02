import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

interface IData {
  balance: string;
  emailFrom: string;
  emailTo: string;
}

export class NeedMoneyUseCase{

  async needMoney(data: IData, response: Response) {
    try {
      const requests = await prismaClient.money_requests.findMany({where: {emailFrom: data.emailFrom, emailTo: data.emailTo}, select: {balance: true}})
      if (requests.length === 1) {
        return response.status(200).json({success: false, message: `Prrs! Toda hora a pedir? Já pediste ${requests[0].balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}, queres mais o quê crlh?`})
      }
      await prismaClient.money_requests.create({data: {
        emailFrom: data.emailFrom,
        emailTo: data.emailTo,
        balance: parseFloat(data.balance),
        date: Date.now().toString(),
        status: 1
      }})
      const body = {
        tittle: "Você recebeu uma solicitação de dinheiro.",
        email: data.emailTo,
        type: 2
      }
      const resp = await axios.post(`${process.env.BASE_URL}/createNotification`, body)
      if (resp.data.success) {
        return response.status(201).json({success: true ,message: "Solicitação enviada com sucesso!"})
      }
      return response.status(400).json({success: false ,message: "Solicitação não enviada!"})
    }
    catch(err) {
      return response.status(200).json({success: err, message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde."})
    }
  }

   execute(request: Request, response: Response) {
    const data:IData = request.body
      this.needMoney(data, response)
    }
}