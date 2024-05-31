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
    const accountFrom = await prismaClient.account.findFirst({where: {account_number: data.accountFrom}, select: {authorized_balance: true, available_balance: true, account_id: true, account_nbi: true, client: true}})
    const transferences = await prismaClient.transfers.findFirst({where: {accountFrom: data.accountFrom}})
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  // Soma o total das transferências realizadas hoje
  const totalTransferredToday = await prismaClient.transfers.aggregate({
    _sum: {
      balance: true
    },
    where: {
      accountFrom: data.accountFrom,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const  totalAmount: any = totalTransferredToday._sum.balance || 0;

  // Verifica se a nova transferência excede o limite diário
  if (parseFloat(totalAmount) + parseFloat(data.balance) > 5000000) {
    return response.status(200).json({ message: "Limite diário de transferências excedido." });
  }
  // biome-ignore lint/style/noUselessElse: <explanation>
  else  {
    if ((accountFrom?.authorized_balance || 0) < parseFloat(data.balance)) {
      return response.status(200).json({message: "Saldo insuficiente."})
    }
    try {
      // Encontra a conta de destino e atualiza os saldos das contas envolvidas na transferência
      const accountTo = await prismaClient.account.findFirst({where: {account_iban: `AO06${data.accountTo}`}, select: {authorized_balance: true, available_balance: true, account_id: true, account_number: true, account_nbi: true, client: true}})
      await prismaClient.account.update(({where: {account_id: accountTo?.account_id}, data: {authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") + parseFloat((data.balance))}}))
      const result = await prismaClient.account.update(({
        where: {account_id: accountFrom?.account_id}, 
        data: {authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance))},
        select: {authorized_balance: true, available_balance: true}
      }))
      // Cria um registro da transferência na tabela de transferências
      const personalTo:{name: string[], birthDate: string} = accountTo?.client?.personal_data as {name: string[], birthDate: string}
      const personalFrom:{name: string[], birthDate: string} = accountFrom?.client?.personal_data as {name: string[], birthDate: string}
      await prismaClient.transfers.create({data: 
        {
          type: 1, 
          accountTo: accountTo?.account_nbi,
          accountFrom: accountFrom?.account_nbi,
          balance: data.balance,
          transfer_description: !data.transfer_description ? "Transferência Interbancária na rede Multicaixa" : data.transfer_description,
          receptor_description: !data.receptor_description ? personalTo.name.join(' ') : data.receptor_description,
          emissor_description: personalFrom.name.join(' '),
          date: Date.now().toString(),
          status: "Finalizada",
          pre_balance: accountFrom?.available_balance,
          pos_balance: (accountFrom?.available_balance || 0) - (parseInt(data.balance))
        }})
      return response.status(201).json({message: "Operação concluída com sucesso!", availabe_balance: result.available_balance, authorized_balance: result.authorized_balance})
    }
    catch {
      return response.status(200).json({message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde."})
    }
  }
  }
  
  execute(request: Request, response: Response) {
    const data: bodyData = request.body
    this.transfer(data, response)
  }
}
