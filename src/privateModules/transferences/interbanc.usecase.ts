import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Definição do tipo de dados esperado no corpo da requisição
type bodyData = {
  balance: string, 
  accountFrom: string,
  accountTo: string,
  receptor_description: string,
  transfer_description: string
}

export class TransferInterbancUseCase {
  
  async transfer(data: bodyData, response: Response) {
    // Verifica se a conta de origem possui saldo suficiente para a transferência
    const accountFrom = await prismaClient.account.findFirst({where: {account_number: data.accountFrom}, select: {authorized_balance: true, available_balance: true, account_id: true}})
    if ((accountFrom?.authorized_balance || 0) < parseFloat(data.balance)) {
      return response.status(200).json({message: "Saldo insuficiente."})
    }
    try {
      // Encontra a conta de destino e atualiza os saldos das contas envolvidas na transferência
      const accountTo = await prismaClient.account.findFirst({where: {account_iban: `AO06${data.accountTo}`}, select: {authorized_balance: true, available_balance: true, account_id: true, account_number: true}})
      await prismaClient.account.update(({where: {account_id: accountTo?.account_id}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") + parseFloat((data.balance))}}))
      const result = await prismaClient.account.update(({
        where: {account_id: accountFrom?.account_id}, 
        data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance))},
        select: {authorized_balance: true, available_balance: true}
      }))
      // Cria um registro da transferência na tabela de transferências
      
      await prismaClient.transfers.create({data: {type: 1, accountTo: `AO06${data.accountTo}`, accountFrom: data.accountFrom, balance: data.balance, transfer_description: data.transfer_description, receptor_description: data.receptor_description, date: Date.now().toString(), status: "Finalizada"}})
      return response.status(201).json({message: "Operação concluída com sucesso!", availabe_balance: result.available_balance, authorized_balance: result.authorized_balance})
    }
    catch {
      return response.status(200).json({message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde."})
    }
  }
  
  execute(request: Request, response: Response) {
    const data: bodyData = request.body
    this.transfer(data, response)
  }
}
