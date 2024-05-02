import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

type bodyData = {
  balance: string, 
  accountFrom: string,
  accountTo: string,
  receptor_description: string,
  tranfer_description: string
}

export class TransferIntrabancUseCase{
  
  // Método assíncrono para realizar a transferência intrabancária
  async transfer(data: bodyData, response: Response) {
    // Busca a conta de origem com base no número da conta fornecido
    const accountFrom = await prismaClient.account.findFirst({where: {account_number: data.accountFrom}, select: {authorized_balance: true, available_balance: true, account_id: true, account_nbi: true, client: true}})
    
    // Verifica se a conta de origem possui saldo suficiente para a transferência
    if (parseFloat(accountFrom?.authorized_balance?.toString() || "") < parseFloat(data.balance)) {
      return response.status(200).json({message: "Saldo insuficiênte."})
    }
    
    try {
      // Busca a conta de destino com base no número da conta fornecido
      const accountTo = await prismaClient.account.findFirst({where: {account_number: data.accountTo}, select: {authorized_balance: true, available_balance: true, account_id: true, account_nbi: true, client: true}})
      
      // Atualiza os saldos das contas de origem e destino após a transferência
      await prismaClient.account.update(({where: {account_id: accountTo?.account_id}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") + parseFloat((data.balance))}}))
      const result = await prismaClient.account.update(({where: {account_id: accountFrom?.account_id}, data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance))}, select: {available_balance: true, authorized_balance: true}}))
      const personalTo:{name: string[], birthDate: string} = accountTo?.client?.personal_data as {name: string[], birthDate: string}
      const personalFrom:{name: string[], birthDate: string} = accountFrom?.client?.personal_data as {name: string[], birthDate: string}
      
      // Registra a transferência na base de dados
     await prismaClient.transfers.create({data: 
      {
        type: 2, 
        accountFrom: accountFrom?.account_nbi, 
        accountTo: accountTo?.account_nbi, 
        balance: data.balance, 
        transfer_description: !data.tranfer_description ? "Transferência Intrabancária na rede Multicaixa" : data.tranfer_description,
        receptor_description: !data.receptor_description ? personalTo.name.join(' ') : data.receptor_description,
        emissor_description: personalFrom.name.join(' '),
        date: Date.now().toString(), 
        status: "Finalizada"}})
      
      // Retorna uma mensagem de sucesso após a operação ser concluída
      return response.status(201).json({message: "Operação concluida com sucesso!", availabe_balance: result.available_balance, authorized_balance: result.authorized_balance})
    }
    catch {
      // Retorna uma mensagem de erro caso ocorra algum problema durante o processo
      return response.status(200).json({message: "Ocorreu um erro ao processar a sua solitação! Tente novamente mais tarde."})
    }
  }
  
  // Método para executar a transferência intrabancária
  execute(request: Request, response: Response) {
    const data:bodyData = request.body
    this.transfer(data, response)
  }
}
