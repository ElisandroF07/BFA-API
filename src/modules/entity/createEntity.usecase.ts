import { Request, Response, response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import { Prisma } from "@prisma/client";

interface ISubProduct {
    id: number,
    name: string 
}

interface IProducts {
    id: number, 
    name: string,
    subProducts: ISubProduct[]
}

interface IData {
    name: string,
    description: string,
    reference: number,
    products: Prisma.InputJsonValue
}

export class CreateEntityUseCase {

    createIBAN(): string {
    // Gera um número aleatório formatado para IBAN
    const numeroAleatorio = Math.floor(Math.random() * 100000000000000);
    const numeroFormatado = numeroAleatorio.toString().padStart(15, "0");
    return `AO06004000${numeroFormatado}`;
    }

    createAccountNumber(): string {
    // Gera um número aleatório formatado para número da conta
    const numerosAleatorios = Array.from({ length: 9 }, () =>
        Math.floor(Math.random() * 10),
    ).join("");
    return `${numerosAleatorios}.10.001`;
    }

    async create(data: IData, response: Response) {
        try {
            const account = await prismaClient.account.create({data: {
                account_iban: this.createIBAN(),
                account_nbi: this.createIBAN(),
                account_number: this.createAccountNumber(),
                account_role: 2,
                bic: "BFMAXLOU",
                state: "Ativa",
                up_balance: 0.00,
                available_balance: 0.00,
                authorized_balance: 0.00
                }, 
                select: {
                    account_id: true
                }
            })


            const entity = await prismaClient.entity.create({
                data: {
                    reference: data.reference.toString(),
                    description: data.description,
                    name: data.name,
                    account_id: account.account_id,
                    products: data.products
                }
            });
    
            return response.status(201).json({success: true, entity: entity, account: account})
        }
        catch {
            return response.status(200).json({success: false, entity: null, account: null})
        }
    }

    execute(request: Request, response: Response) {
        const data: IData = request.body
        this.create(data, response)
    }

}