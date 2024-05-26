import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"
import axios from "axios"

export class GetUserDataUseCase {

  async getUser(biNumber: string, response: Response) {
    try {
      // Busca o cliente com base no número do BI
      const client = await prismaClient.client.findFirst({ where: { bi_number: biNumber }, select: { personal_data: true, client_id: true, address: true, bi_number: true }, cacheStrategy: { ttl: 120 } })
      
      // Busca o email associado ao cliente
      const email = await prismaClient.client_email.findFirst({ where: { client_id: client?.client_id || 0 }, select: { email_address: true }, cacheStrategy: { ttl: 120 } })
      
      // Busca o caminho da imagem de perfil associada ao cliente
      const resp = await axios.get(`${process.env.BASE_URL}/getProfilePicture/${biNumber}`)
      const pictureProfile = resp.data.imageUrl 

      
      // Retorna os dados do cliente, incluindo informações pessoais, endereço, número do BI, email e caminho da imagem de perfil
      response.status(200).json({ client: { personalData: client?.personal_data, address: client?.address, biNumber: client?.bi_number, email: email?.email_address, pictureProfile: pictureProfile } })
    } catch {
      // Retorna um erro caso ocorra algum problema na execução
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    // Extrai o número do BI da requisição
    const biNumber = request.params.biNumber
    // Chama a função para obter os dados do usuário com base no número do BI
    await this.getUser(biNumber, response)
  }
}
