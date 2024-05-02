import { Response, Request } from "express"
import { prismaClient } from "../../infra/database/prismaClient"
const sendUpmoney = require('../../libs/sendUpmoney')
const bcrypt = require("bcryptjs");

interface IData {
  emailFrom: string,
  balance: string,
  emailTo: string,
  pin: string
}

export class CreateUpmoneyUseCase {

  generateNumber(): number {
    let numero = '';
    for (let i = 0; i < 10; i++) {
        numero += Math.floor(Math.random() * 10);
    }
    return parseInt(numero);
  }
  
  async encrypt(OTP: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(OTP, salt);
		return OTPHash;
	}

  async create(data:IData, response: Response) {
    const balance = parseFloat(data.balance);
    if (balance < 1000 || balance > 200000 || balance % 1000 !== 0) {
      return response.status(200).json({success: false, message: "O montante deve estar entre 1000Kz e 200.000Kz. Somente são aceites montantes na casa dos 1000."});
    }
    try {
      const emailFro = await prismaClient.client_email.findFirst({where: {email_address: data.emailFrom.toString()}, select: {client: true}})
      const accountFrom = await prismaClient.account.findFirst({where: {client_id: emailFro?.client?.client_id || 0}, select: {available_balance: true, account_number: true, authorized_balance: true, account_id: true, account_nbi: true, up_balance: true, client: true}})
      if ((accountFrom?.authorized_balance || 0) < parseFloat(data.balance)) {
        return response.status(200).json({success: false, message: "Saldo insuficiente!" })
      }
      const personalFrom:{name: string[], birthDate: string} = accountFrom?.client?.personal_data as {name: string[], birthDate: string}
      const account = await prismaClient.account.update({where: {account_id: accountFrom?.account_id || 0}, data: {
        authorized_balance: parseFloat(accountFrom?.authorized_balance?.toString() || "") - parseFloat(data.balance),
        up_balance: parseFloat(accountFrom?.up_balance?.toString() || "") + parseFloat(data.balance)
      }, select: {authorized_balance: true, available_balance: true, up_balance: true}})
      const transfer = await prismaClient.transfers.create({
        data: {
          accountFrom: accountFrom?.account_nbi,
          balance: data.balance,
          date: Date.now().toString(),
          status: "Pentende",
          type: 6,
          transfer_description: "Levantamento sem cartão",
          emissor_description: personalFrom.name.join(' '),
          receptor_description: "Nenhum",
          accountTo: "Nenhum"
        }
      })
      const upMoneyNumber = this.generateNumber()
      const pinHash = await this.encrypt(data.pin)
      const upmoney = await prismaClient.upmoney.create({
        data: {
          transferId: transfer.id,
          accountFrom: accountFrom?.account_nbi,
          balance: parseFloat(data.balance),
          date: Date.now().toString(),
          status: 1,
          number: parseInt(upMoneyNumber.toString()),
          pin: pinHash
        }
      })
      const upmoneys =  await prismaClient.upmoney.findMany({
        where: { accountFrom: accountFrom?.account_number || "" },
        select: {
          accountFrom: true,
          balance: true,
          date: true,
          id: true,
          number: true,
          status: true,
          transferId: true,
        },
      });

      const upmoneyList = upmoneys.map(item => ({
        ...item,
        number: item?.number?.toString(), // Convertendo o number para string
      }));

      await sendUpmoney(data.emailTo, "Levantamento sem cartão", upMoneyNumber)
      return response.status(200).json({
        success: true, 
        message: "Levantamento sem cartão enviado com sucesso!", 
        upmoney: {number: upmoney.number?.toString(), balance: upmoney.balance?.toString(), pin: data.pin, date: upmoney.date}, account: {authorized_balance: account.authorized_balance, available_balance: account.available_balance, up_balance: account.up_balance},
        upmoneyList
        })
    }
    catch(err) {
      console.log(err)
      return response.status(500).json({success: false, message: err})
    }
  }

  execute(request: Request, response: Response) {
    const data:IData = request.body
    this.create(data, response)
  }
}

