import { Response } from "express";
import { prismaCient } from "../../infra/database/prismaClient";
const bcrypt = require('bcryptjs')
const sendNote = require('../../libs/sendNote')

export class SetAccessCodeUseCase{

    constructor(){}

    async encrypt(token: string): Promise<string> {
        const salt = await bcrypt.genSalt(12)
        const tokenHash = await bcrypt.hash(token, salt)
        return tokenHash 
    }

    async setAccessCode(data: any, response: Response) {
        try {
            const { accessCode, confirmAccessCode, email } = data;
            if (accessCode === confirmAccessCode) {
                const clientEmail = await prismaCient.client_email.findFirst({
                    where: { email_address: email },
                    select: { client_id: true }
                });
                if (clientEmail) {
                    const accessCodeHash = await this.encrypt(accessCode);
                    await prismaCient.client.update({
                        where: { client_id: clientEmail.client_id || 0 },
                        data: { access_code: accessCodeHash }
                    });
                    await sendNote(email, "Alteração do código de acesso");
                    response.status(201).json({ message: "O código de acesso foi alterado com sucesso!" });
                } else {
                    response.status(400).json({ message: 'O email é inválido!' });
                }
            } else {
                response.status(400).json({ message: "Os campos possuem valores diferentes!" });
            }
        } catch (error) {
            console.error("Erro ao definir código de acesso:", error);
            response.status(500).json({ message: "Erro interno! Tente novamente mais tarde." });
        }
    }
    

    async execute(data: any, response: Response) {
        await this.setAccessCode(data, response)
    }
}