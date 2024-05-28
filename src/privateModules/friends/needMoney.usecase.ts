import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

// Interface para os dados necessários para solicitar dinheiro
interface IData {
  balance: string; // O saldo a ser solicitado
  emailFrom: string; // O e-mail do remetente
  emailTo: string; // O e-mail do destinatário
}

// Classe responsável por lidar com a solicitação de dinheiro
export class NeedMoneyUseCase{

  // Método assíncrono para solicitar dinheiro
  async needMoney(data: IData, response: Response) {
    try {
      // Verifica se já existe uma solicitação de dinheiro entre os mesmos emails
      const requests = await prismaClient.money_requests.findMany({where: {emailFrom: data.emailFrom, emailTo: data.emailTo}, select: {balance: true}})
      if (requests.length === 1) {
        // Se já existir, retorna uma mensagem informando que já foi feita uma solicitação
        return response.status(200).json({success: false, message: `Solicitação negada! Já foi feito um pedido de ${requests[0].balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}. Aguarde a resposta do solicitado!`})
      }
      const accountTo = await prismaClient.client_email.findFirst({where: {email_address: data.emailTo}, select: {client: true}, cacheStrategy: { ttl: 1 }})
      const personalTo:{name: string[], birthDate: string} = accountTo?.client?.personal_data as {name: string[], birthDate: string}
      const accountFrom = await prismaClient.client_email.findFirst({where: {email_address: data.emailFrom}, select: {client: true}})
      const personalFrom:{name: string[], birthDate: string} = accountFrom?.client?.personal_data as {name: string[], birthDate: string}
      // Cria uma nova solicitação de dinheiro
      await prismaClient.money_requests.create({data: {
        emailFrom: data.emailFrom,
        emailTo: data.emailTo,
        balance: parseFloat(data.balance),
        date: Date.now().toString(),
        status: 1
      }})

      // Envia uma notificação para o destinatário da solicitação
      const body = {
        tittle: `${personalFrom.name[0]} ${personalFrom.name[personalFrom.name.length - 1]} enviou uma solicitação de dinheiro!`,
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
      // Se ocorrer um erro, retorna uma mensagem de erro
      return response.status(200).json({success: err, message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde."})
    }
  }

  // Método para executar a solicitação de dinheiro a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const data:IData = request.body
    this.needMoney(data, response)
  }
}
