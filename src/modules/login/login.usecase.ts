import { Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export class LoginUseCase {
  // Método para autenticar um usuário com base no número de adesão ou email e código de acesso
  async login(membership: string, access_code: string, response: Response) {
    // Verifica se o login é feito com um email
    if (membership.includes("@")) {
      // Encontra o cliente pelo email na base de dados
      const client_email = await prismaClient.client_email.findFirst({where: {email_address: membership.toLowerCase()}, select: {client_id: true}, cacheStrategy: { ttl: 420 }});
      const client = await prismaClient.client.findFirst({
        where: {
          client_id: client_email?.client_id || 0,
        },
        select: {
          access_code: true,
          client_id: true,
          membership_number: true,
          bi_number: true,
          personal_data: true,
          professional_data: true,
          address: true,
          role_id: true,
        },
        cacheStrategy: { ttl: 400 }
      });
      if (client) {
        // Verifica se a senha está correta
        if (await bcrypt.compare(access_code, client.access_code)) {
          // Retorna uma resposta de sucesso com o email e número de adesão do cliente
          return response.status(201).json({ message: "Sucesso!", email: membership, membership_number: client.membership_number});
        }
        // Retorna uma mensagem de erro se a senha estiver incorreta
        return response
          .status(200)
          .json({ message: "Código de acesso incorreto!" });
      }
      // Retorna uma mensagem de erro se o email não for encontrado
      return response
        .status(200)
        .json({ message: "Email não encontrado!" });
    }
    // Se o login for feito com o número de adesão
    const client = await prismaClient.client.findFirst({
      where: {
        membership_number: membership,
      },
      select: {
        access_code: true,
        client_id: true,
        membership_number: true,
        bi_number: true,
        personal_data: true,
        professional_data: true,
        address: true,
        role_id: true,
      },
      cacheStrategy: { ttl: 400 }
    });
    if (client) {
      // Encontra o email do cliente na base de dados
      const email = await prismaClient.client_email.findFirst({where: {client_id: client.client_id}, select: {email_address: true}, cacheStrategy: { ttl: 400 }});
      // Verifica se a senha está correta
      if (await bcrypt.compare(access_code, client.access_code)) {
        // Retorna uma resposta de sucesso com o email e número de adesão do cliente
        return response.status(201).json({ message: "Sucesso!", email: email?.email_address, membership_number: membership});
      }
      // Retorna uma mensagem de erro se a senha estiver incorreta
      return response
        .status(200)
        .json({ message: "Código de acesso incorreto!" });
    }
    // Retorna uma mensagem de erro se o número de adesão não for encontrado
    return response
      .status(200)
      .json({ message: "Número de adesão não encontrado!" });
  }

  // Método executado para realizar o login
  async execute(data: any, response: Response) {
    const { membership_number, access_code } = data;
    await this.login(membership_number, access_code, response);
  }
}
