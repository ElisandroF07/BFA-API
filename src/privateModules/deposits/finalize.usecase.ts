import {Request, Response} from 'express'
import { prismaClient } from '../../infra/database/prismaClient'

export class FinalizeDPUseCase {
  async finalize(expire: string, email: string, response: Response) {
    try {
      const deposit = await prismaClient.deposits.findFirst({where: {
        expires_at: expire
      }})
      const account = await prismaClient.account.findFirst({where: {account_nbi: deposit?.account}})
      const getAccount = await prismaClient.account.update({where: {account_id: account?.account_id}, data: {
        authorized_balance: (account?.authorized_balance || 0) + (deposit?.poupanca_liquida || 0),
        available_balance: (account?.available_balance || 0) + (deposit?.poupanca_liquida || 0)
      }})
      const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
      const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}    
      await prismaClient.transfers.create({data: {
        balance: deposit?.poupanca_liquida,
        accountFrom: deposit?.type?.toString(),
        emissor_description: deposit?.balance?.toString(),
        accountTo: deposit?.account,
        date: Date.now().toString(),
        status: "Finalizada",
        type: 11,
        receptor_description: name.name.join(" "),
        transfer_description: "Reembolso do capital investido - DP",
        pre_balance: account?.available_balance,
        pos_balance: getAccount.available_balance,

      }})
      await prismaClient.notifications.create({data: {
        email: email,
        type: 1,
        tittle: "O seu DP chegou ao fim!!! Confira."
      }})
      response.status(200).json({success: true, available_balance: getAccount.available_balance, authorized_balance: getAccount.authorized_balance ,message: "Deposito finalizado com sucesso"})
    }
    catch {
      return response.status(200).json({success: false, message: "Erro ao finalizar depósito"})
    }
    
  }

  execute (request: Request, response: Response) {
    const expire = request.params.expire
    const email = request.params.email
    this.finalize(expire, email, response)
  }
}