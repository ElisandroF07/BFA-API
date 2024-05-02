import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData {
  entityId: string,
  description: string,
  balance: number,
}

export class CreateReferenceUseCase {

  createReference(): string {
		// Gera um número aleatório formatado para número da conta
		const numerosAleatorios = Array.from({ length: 9 }, () =>
			Math.floor(Math.random() * 10),
		).join("");
		return `${numerosAleatorios}`;
	}

  async create(data: IData ,response: Response) {
    try {
      const accountComerce = await prismaClient.account.findFirst({where: {account_number: data.entityId}, select: {account_nbi: true, client: true}})
      const personalFrom:{name: string[], birthDate: string} = accountComerce?.client?.personal_data as {name: string[], birthDate: string}
      const reference = await prismaClient.pay_references.create({
        data: {
          date: Date.now().toString(),
          description: data.description,
          balance: data.balance,
          entity: accountComerce?.account_nbi || "",
          emissor_description: personalFrom.name.join(' '),
          reference: this.createReference(),
          state: 1
        }
      })
      return response.status(201).json({success: true, reference: reference})
    }
    catch {
      return response.status(200).json({success: false, reference: null})
    }
  }

  execute(request: Request, response: Response) {
    const data:IData = request.body
    this.create(data, response)
  }
}