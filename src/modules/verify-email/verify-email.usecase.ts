import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendMail = require("../../libs/sendEmail");
const bcrypt = require("bcryptjs");

export class VerifyEmailUseCase {
  // Método para criptografar um token usando bcrypt
  async encrypt(token: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const tokenHash = await bcrypt.hash(token, salt);
    return tokenHash;
  }

  // Método para enviar o token de confirmação por e-mail
  async sendToken(email: string, response: Response) {
    const res = await prismaClient.client_email.findFirst({
      where: { email_address: email },
      select: { verified: true, email_id: true, complete: true, client_id: true }
    });

    if (res) {
      // Verifica se o e-mail já está associado a uma conta
      if (res.complete) {
        return response
          .status(200)
          .json({ message: "O email já está associado à uma conta!" });
      }
      try {
        // Gera um novo token aleatório
        const token = crypto.randomBytes(32).toString("hex");
        // Criptografa o token
        const tokenHash = await this.encrypt(token);
        // Atualiza o token no banco de dados
        await prismaClient.client_email.update({
          where: {
            email_id: res.email_id,
          },
          data: {
            token: tokenHash,
            verified: false
          },
        });
        // Monta a URL de confirmação com o token criptografado
        const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`;
        // Envia o e-mail de confirmação
        await sendMail(email, "Confirmar Email", url);
        return response
          .status(201)
          .json({ message: `Email enviado para o endereço: ${email}` });
      } catch(err) {
        return response
          .status(500)
          .json({ message: err });
      }
    } else {
      try {
        // Gera um novo token aleatório
        const token = crypto.randomBytes(32).toString("hex");
        // Criptografa o token
        const tokenHash = await this.encrypt(token);
        // Cria um novo registro no banco de dados
        await prismaClient.client_email.create({
          data: {
            email_address: email,
            verified: false,
            role_id: 1,
            token: tokenHash,
            complete: false
          },
        });
        // Monta a URL de confirmação com o token criptografado
        const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`;
        // Envia o e-mail de confirmação
        await sendMail(email, "Confirmar Email", url);
        return response
          .status(201)
          .json({ message: `Email enviado para o endereço: ${email}` });
      } catch (err) {
        return response
          .status(500)
          .json({ message: err });
      }
    }
  }

  // Método principal que executa a lógica do caso de uso
  execute(response: Response, request: Request) {
    const email = request.params.email;
    this.sendToken(email, response);
  }
}
