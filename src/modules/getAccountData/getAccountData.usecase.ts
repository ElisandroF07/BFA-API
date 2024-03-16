import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetAccountDataUseCase{

  async getData(biNumber: string, response: Response){
    try {
      const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}})
      const account = await prismaClient.account.findFirst({where: {client_id: client?.client_id || 0}, select: {
        account_iban: true,
        account_nbi: true,
        account_role: true,
        account_number: true,
        authorized_balance: true,
        bic: true,
        available_balance: true,
        created_at: true,
        currency: true,
        state: true,
      }})
      
      response.status(200).json({account: {role: account?.account_role, iban: account?.account_iban, nbi: account?.account_nbi, number: account?.account_number, available_balance: account?.available_balance, authorized_balance: account?.authorized_balance, created_at: account?.created_at, currency: account?.currency, state: account?.state, bic: account?.bic}})
    }
    catch (error){
      console.log(error);
      
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    await this.getData(biNumber, response)
  }
}