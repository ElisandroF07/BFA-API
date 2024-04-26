import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs")

// Define a estrutura dos dados esperados
interface IData {
  accessCode: string, // Código de acesso inserido pelo usuário
  biNumber: string // Número de identificação do cliente
}

export class CheckAccessCode {
  // Verifica se o código de acesso está correto
  async check(data: IData, response: Response) {
    // Procura no banco de dados o código de acesso associado ao cliente
    const client = await prismaClient.client.findFirst({where: {bi_number: data.biNumber}, select: {access_code: true}})
    
    // Compara o código de acesso fornecido com o código armazenado no banco de forma segura
    if (await bcrypt.compare(data.accessCode, client?.access_code)) {
      // Se os códigos coincidirem, retorna que o código é válido
      return response.status(201).json({valid: true})
    }
    // Caso contrário, retorna que o código é inválido
    return response.status(201).json({valid: false})
  }

  // Executa a verificação do código de acesso
  execute(request: Request, response: Response) {
    // Extrai os dados da requisição e chama a função de verificação
    this.check(request.body, response)
  }
}
