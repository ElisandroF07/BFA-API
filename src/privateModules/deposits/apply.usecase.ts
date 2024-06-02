import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData{
  account: string,
  type: number,
  balance: number,
  duration: number
}

export class AppyUseCase {

  ts(days: number): number {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return futureDate.getTime();
  }
  async apply(data: IData, response: Response) {
    try {
      let juro_bruto = 0
    let juro_liquido = 0
    let retencao = 0
    let poupanca_liquida = 0
    const taxa_de_retencao = 10
    const tanb = data.type === 1 ? 10 : data.type === 2 ? 13 : 0
    const account = await prismaClient.account.findFirst({where: {account_number: data.account}})
    if ((account?.authorized_balance || 0) < data.balance) {
      return response.status(200).json({success: false, message: "Saldo insuficiente!"})
    }
    // biome-ignore lint/style/noUselessElse: <explanation>
    else  {
      if (data.type === 3) {
        const juros_brutos1 = data.balance * ((5.50/100) * ((90 || 0)/365))
        const retencao1 = juros_brutos1 * (taxa_de_retencao/100)
        const juros_liquidos1 = juros_brutos1 - retencao1
  
        const juros_brutos2 = data.balance * ((7.50/100) * ((90 || 0)/365))
        const retencao2 = juros_brutos2 * (taxa_de_retencao/100)
        const juros_liquidos2 = juros_brutos2 - retencao2
  
        const juros_brutos3 = data.balance * ((12.50/100) * ((90 || 0)/365))
        const retencao3 = juros_brutos3 * (taxa_de_retencao/100)
        const juros_liquidos3 = juros_brutos3 - retencao3
  
        juro_bruto = juros_brutos1 + juros_brutos2 + juros_brutos3
        juro_liquido = juros_liquidos1 + juros_liquidos2 + juros_liquidos3
        retencao = retencao1 + retencao2 + retencao3
        poupanca_liquida = data.balance + juro_liquido
  
      }
      else {
        const juro_bruto1 = data.balance * ((tanb/100) * (data.duration/365))
        const retencao1 = juro_bruto1 * (taxa_de_retencao/100)
        const juro_liquido1 = juro_bruto1 - retencao1
        const poupanca_liquida1 = data.balance + juro_liquido1
  
        juro_bruto = juro_bruto1
        juro_liquido = juro_liquido1
        retencao = retencao1
        poupanca_liquida = poupanca_liquida1
      }
      const getAccount = await prismaClient.account.update({where: {account_id: account?.account_id || 0}, data: {authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") - data.balance, available_balance: parseFloat(account?.available_balance?.toString() || "") - data.balance}})
      const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
      const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
      const final = this.ts(data.duration).toString()
      const transfer = await prismaClient.transfers.create({data: {
        balance: data.balance,
        accountFrom: account?.account_nbi,
        date: Date.now().toString(),
        status: "Finalizada",
        type: 10,
        pre_balance: account?.available_balance,
        pos_balance: getAccount.available_balance,
        emissor_description: name.name.join(' '),
        receptor_description: final,
        accountTo: `${data.type.toString()}.${juro_liquido}`,
        transfer_description:`Aplicação de Depósito à Prazo - ${data.type === 1 ? "DP BFA 10%" : data.type === 2 ? "DP BFA 13%" : "DP ESPECIAL CRESCENTE"}`     
      }})
  
      const deposit = await prismaClient.deposits.create({data: {
        account: account?.account_nbi,
        balance: data.balance, 
        date: Date.now().toString(),
        juro_bruto: juro_bruto,
        juro_liquido: juro_liquido,
        retencao: retencao,
        poupanca_liquida: poupanca_liquida,
        transaction_id: transfer.id,
        type: data.type,
        expires_at: final
      }})
  
      return response.status(201).json({sucess: true, availabe_balance: getAccount.available_balance, authorized_balance: getAccount.authorized_balance})
    }
    }
    catch {
      return response.status(200).json({success: false, data: null})
    }
    
  }

  execute(request: Request, response: Response) {
    const data: IData = request.body
    this.apply(data, response)
  }
}