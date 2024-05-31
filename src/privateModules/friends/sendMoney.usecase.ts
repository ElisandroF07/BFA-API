import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Interface para os dados necessários para enviar dinheiro
interface IData {
  balance: string; // Valor a ser enviado
  email: string; // Email do destinatário
  accountNumber: string; // Número da conta do destinatário
}

// Classe responsável por lidar com o envio de dinheiro
export class SendMoneyUseCase {

  // Método assíncrono para enviar dinheiro
  async send(data: IData, response: Response) {
    try {
      // Encontra o cliente pelo email
      const client_email = await prismaClient.client_email.findFirst({ where: { email_address: data.email }, select: { client: true }, cacheStrategy: { ttl: 1 } });
      
      // Encontra a conta do remetente pelo número da conta
      const accountFrom = await prismaClient.account.findFirst({ where: { account_number: data.accountNumber }, select: { account_id: true, authorized_balance: true, available_balance: true, account_nbi: true, client: true } });
      
      // Encontra a conta do destinatário pelo ID do cliente
      const accountTo = await prismaClient.account.findFirst({ where: { client_id: client_email?.client?.client_id || 0 }, select: { account_id: true, account_number: true, authorized_balance: true, available_balance: true, account_nbi: true, client: true } });
      
      // Verifica se o saldo do remetente é suficiente
      if (((accountFrom?.authorized_balance || 0) < parseFloat(data.balance)) ) {
        return response.status(200).json({ success: false, message: "Saldo insuficiente!" });
      }
      
      // Atualiza o saldo da conta do destinatário
      await prismaClient.account.update(({ where: { account_id: accountTo?.account_id }, data: { authorized_balance: parseFloat(accountTo?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(accountTo?.available_balance?.toString() || "") + parseFloat((data.balance)) } }));
      
      // Atualiza o saldo da conta do remetente
      await prismaClient.account.update(({ where: { account_id: accountFrom?.account_id }, data: { authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance)) } }));
      const personalTo:{name: string[], birthDate: string} = accountTo?.client?.personal_data as {name: string[], birthDate: string}
      const personalFrom:{name: string[], birthDate: string} = accountFrom?.client?.personal_data as {name: string[], birthDate: string}
      
      // Registra a transferência
      await prismaClient.transfers.create({ data: { type: 5,
         accountFrom: accountFrom?.account_nbi, 
         accountTo: accountTo?.account_nbi, 
         balance: data.balance, 
         transfer_description: "Transferência instantânea", 
         receptor_description: personalTo.name.join(' '), 
         emissor_description: personalFrom.name.join(' '),
         date: Date.now().toString(), 
         status: "Finalizada",
         pre_balance: accountFrom?.available_balance,
         pos_balance: (accountFrom?.available_balance || 0) -  (parseInt(data.balance))
        } });
      
         await prismaClient.notifications.create({data: {
          tittle: `${personalFrom.name[0]} ${personalFrom.name[personalFrom.name.length -1]} enviou ${parseInt(data.balance).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })} à você!`,
          email: data.email,
          type: 1
        }})
      // Retorna uma mensagem de sucesso
      return response.status(201).json({ success: true, message: "Operação processada com sucesso!" });
    }
    catch (err) {
      // Em caso de erro, registra o erro e retorna uma mensagem de falha
      console.log(err);
      return response.status(200).json({ success: false, message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde." });
    }
  }

  // Método para executar o envio de dinheiro a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const data: IData = request.body;
    this.send(data, response);
  }

}
