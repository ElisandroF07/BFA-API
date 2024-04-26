import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData {
  entityReference: number, 
  balance: number,
  clientReferences: {
    phone: number,
    reference: number
  },
  product: string,
  package: string,
  accountNumber: string
}

export class PayUseCase {
  async pay(data: IData, response: Response) {
    try {
      const account = await prismaClient.account.findFirst({where: {account_number: data.accountNumber}})
      const entity = await prismaClient.entity.findFirst({where: {reference: data.entityReference.toString()}})
      const account2 = await prismaClient.account.findFirst({where: {account_id: entity?.account_id || 0}})
      if (data.balance > (account?.authorized_balance || 0)){
        return response.status(200).json({success: false, message: "Saldo insficiente!"})
      }
      switch (data.entityReference) {
        case 645001: 
        case 643002:
        case 673003: {
          const transfer = await prismaClient.transfers.create({
            data: {
              accountFrom: account?.account_number,
              balance: data.balance,
              accountTo: entity?.reference,
              date: Date.now().toString(),
              status: "Finalizada",
              type: 7,
              transfer_description: `Produto: ${data.product} - Pacote: ${data.package} - Destinatário: ${data.clientReferences.phone}`,
              receptor_description: entity?.description,
            }
          })
          const accountFrom = await prismaClient.account.update({where: {account_id: account?.account_id || 0}, data: {
            authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") - parseFloat(data.balance.toString()),
            available_balance: parseFloat(account?.available_balance?.toString() || "") - parseFloat(data.balance.toString())
          }, select: {authorized_balance: true, available_balance: true, up_balance: true}})

          const accountTo = await prismaClient.account.update({where: {account_id: entity?.account_id || 0}, data: {
            authorized_balance: parseFloat(account2?.authorized_balance?.toString() || "") + parseFloat(data.balance.toString()),
            available_balance: parseFloat(account2?.available_balance?.toString() || "") + parseFloat(data.balance.toString())
          }})
          
          return response.status(201).json({success: true, message: "Pagamento efetuado com sucesso!", balances: {authorized_balance: accountFrom.authorized_balance, available_balance: accountFrom.available_balance, up_balance: accountFrom.up_balance}})
        }
        case 691001: 
        case 691002: {
          const transfer = await prismaClient.transfers.create({
            data: {
              accountFrom: account?.account_number,
              balance: data.balance,
              accountTo: entity?.reference,
              date: Date.now().toString(),
              status: "Finalizada",
              type: 8,
              transfer_description: `Referência do cliente: ${data.clientReferences.reference}`,
              receptor_description: entity?.description,
            }
          })
          const accountFrom = await prismaClient.account.update({where: {account_id: account?.account_id || 0}, data: {
            authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") - parseFloat(data.balance.toString()),
            available_balance: parseFloat(account?.available_balance?.toString() || "") - parseFloat(data.balance.toString())
          }, select: {authorized_balance: true, available_balance: true, up_balance: true}})

          const accountTo = await prismaClient.account.update({where: {account_id: entity?.account_id || 0}, data: {
            authorized_balance: parseFloat(account2?.authorized_balance?.toString() || "") + parseFloat(data.balance.toString()),
            available_balance: parseFloat(account2?.available_balance?.toString() || "") + parseFloat(data.balance.toString())
          }})
          return response.status(201).json({success: true, message: "Pagamento efetuado com sucesso!", balances: {authorized_balance: accountFrom.authorized_balance, available_balance: accountFrom.available_balance, up_balance: accountFrom.up_balance}})
        }
        default: {
          return response.status(200).json({success: false, message: "Entidade não encontrada!", balances: null})
        }
      }
    }
    catch {
      return response.status(200).json({success: false, balances: null, message: "Ocorreu uma erro ao processar a sua solicitação!"})
    }
  }

  execute(request: Request, response: Response) {
    const data:IData = request.body
    this.pay(data, response)
  }
}