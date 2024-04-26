import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs")

export class Check2FA{

  // Método assíncrono para verificar o OTP (One-Time Password) de autenticação de dois fatores
  async check(biNumber: string, otp: string, response: Response) {
    // Procura o cliente com o número de BI especificado e seleciona apenas o campo de OTP
    const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {authentication_otp: true}})
    
    // Compara o OTP fornecido com o OTP armazenado de forma segura
    if (await bcrypt.compare(otp, client?.authentication_otp)) {
      // Se os OTPs coincidirem, retorna um JSON com valid: true e um status 201 (Created)
      return response.status(201).json({valid: true})
    }
    // Caso contrário, retorna valid: false e um status 200 (OK)
    return response.status(200).json({valid: false})
  }

  // Método para executar a verificação do OTP
  execute(request: Request, response: Response) {
    // Extrai o OTP e o número de BI da requisição HTTP
    const otp = request.params.otp
    const biNumber = request.params.biNumber
    // Chama o método check para verificar o OTP e envia a resposta de volta ao cliente
    this.check(biNumber, otp, response)
  }
}
