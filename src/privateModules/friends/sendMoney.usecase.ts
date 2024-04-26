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
      const client_email = await prismaClient.client_email.findFirst({ where: { email_address: data.email }, select: { client_id: true } });
      
      // Encontra a conta do remetente pelo número da conta
      const accountFrom = await prismaClient.account.findFirst({ where: { account_number: data.accountNumber }, select: { account_id: true, authorized_balance: true, available_balance: true } });
      
      // Encontra a conta do destinatário pelo ID do cliente
      const account = await prismaClient.account.findFirst({ where: { client_id: client_email?.client_id || 0 }, select: { account_id: true, account_number: true, authorized_balance: true, available_balance: true } });
      
      // Verifica se o saldo do remetente é suficiente
      if (((account?.authorized_balance || 0) < parseFloat(data.balance)) ) {
        return response.status(200).json({ success: false, message: "Saldo insuficiente!" });
      }
      
      // Atualiza o saldo da conta do destinatário
      await prismaClient.account.update(({ where: { account_id: account?.account_id }, data: { authorized_balance: parseFloat(account?.authorized_balance?.toString() || "") + parseFloat((data.balance)), available_balance: parseFloat(account?.available_balance?.toString() || "") + parseFloat((data.balance)) } }));
      
      // Atualiza o saldo da conta do remetente
      await prismaClient.account.update(({ where: { account_id: accountFrom?.account_id }, data: { authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat((data.balance)), available_balance: parseFloat(accountFrom?.available_balance?.toString() || "") - parseFloat((data.balance)) } }));
      
      // Registra a transferência
      await prismaClient.transfers.create({ data: { type: 5, accountFrom: data.accountNumber, accountTo: account?.account_number, balance: data.balance, transfer_description: "Transferência instantânea", receptor_description: data.email, date: Date.now().toString(), status: "Finalizada" } });
      
      // Retorna uma mensagem de sucesso
      return response.status(201).json({ success: true, message: "Operação concluída com sucesso!" });
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
