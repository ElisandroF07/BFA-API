import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData {
  reference: string,
  accountNumber: string
}

export class PayByReferenceUseCase {
  // Método assíncrono para processar o pagamento com base em uma referência e um número de conta
  async pay(data: IData, response: Response) {
    try {
      const pay_reference = await prismaClient.pay_references.findFirst({where: {reference: data.reference}})
      if (pay_reference) {
        const account = await prismaClient.account.findFirst({where: {account_number: data.accountNumber}, select: {account_nbi: true, account_id: true, available_balance: true, authorized_balance: true, client: true}})
        if ((account?.authorized_balance || 0) < (pay_reference?.balance || 0)) {
          return response.status(200).json({message: "Saldo insuficiente."})
        }
        else {
            const balances = await prismaClient.account.update({where: {account_id: account?.account_id || 0}, data: {authorized_balance: (account?.authorized_balance || 0) - (pay_reference.balance || 0), available_balance: (account?.available_balance || 0) - (pay_reference.balance || 0)}, select: {authorized_balance: true, available_balance: true, up_balance: true}})
            const referenceAccount = await prismaClient.account.findFirst({where: {account_nbi: pay_reference?.entity}, select: {authorized_balance: true, account_nbi: true, available_balance: true, client: true, account_id: true}})
            await prismaClient.account.update({where: {account_id: referenceAccount?.account_id || 0}, data: { authorized_balance: (referenceAccount?.authorized_balance || 0) + (pay_reference?.balance || 0), available_balance: (referenceAccount?.available_balance || 0) + (pay_reference?.balance || 0)}})
            const personalTo:{name: string[], birthDate: string} = referenceAccount?.client?.personal_data as {name: string[], birthDate: string}
            const personalFrom:{name: string[], birthDate: string} = account?.client?.personal_data as {name: string[], birthDate: string}
      
            await prismaClient.pay_references.update({where: {
              id: pay_reference?.id || 0
            }, 
            data: {
              state: 2,
              payer_description: personalFrom.name.join(' '),
              payer_nbi: account?.account_nbi
            }})

            await prismaClient.transfers.create({
              data: {
                accountFrom: account?.account_nbi,
                balance: pay_reference.balance,
                accountTo: referenceAccount?.account_nbi,
                date: Date.now().toString(),
                status: "Finalizada",
                type: 9,
                transfer_description: `Ref.${pay_reference.reference} - ${pay_reference.description}`,
                emissor_description: personalFrom.name.join(' '),
                receptor_description: personalTo.name.join(' '),
              }
            })
            return response.status(200).json({ success: true, message: "Pagamento processado com sucesso!", balances });
        }
      }
      else {
        return response.status(200).json({ success: false, message: "Referência de pagamento inválida!", balances: null });
      }
        
    } catch (error) {
      // Em caso de erro, você poderia retornar uma resposta de erro
      return response.status(500).json({ success: false, message: "Erro ao processar o pagamento!", balances: null, error });
    }
  }

  // Método para executar o pagamento a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai a referência e o número da conta da requisição

    const data:IData = request.body
    // Chama o método para processar o pagamento
    this.pay(data, response);
  }

}
