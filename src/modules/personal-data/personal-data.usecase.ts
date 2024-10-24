import axios from "axios";
import { Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class PersonalDataUseCase {
  // Formata o nome em letras maiúsculas e sem espaços extras
  formatName(name: string[]) {
    return name.join(" ").toUpperCase().trim().replace(/\s/g, "");
  }

  // Valida se o número de BI é válido
  validateBi(value: number) {
    const formatedNumber = value.toString();
    const expireAt = formatedNumber.replace(".", "").replace("E", "1");
    const atualDate = Date.now();
    if (parseInt(expireAt) <= atualDate) {
      return false;
    }
    return true;
  }

  // Verifica se a pessoa é maior de idade com base na data de nascimento
  verificarMaioridade(dataString: string): boolean {
    const dataNascimento = new Date(dataString);
    const dataAtual = new Date();

    const idade = dataAtual.getFullYear() - dataNascimento.getFullYear();
    if (idade >= 18) {
      return true;
    }
    return false;
  }

  // Faz o upload dos dados para o backend
  async uploadData(data: any, response: Response) {
    const { name, biNumber, email, birthDate } = data;
    const body = JSON.stringify({
      affairsReceipt: biNumber,
      affairsType: "IDCard",
      captchaValue: "",
    });

    try {
      // Verifica se já existe uma conta associada ao BI
      const resp = await prismaClient.client.findFirst({
        where: { bi_number: biNumber },
        select: { client_id: true },
        cacheStrategy: { ttl: 10 },
      });
      if (resp) {
        return response
          .status(200)
          .json({ message: "Já existe uma conta associada à este BI!" });
      }
      // Verifica se a pessoa é maior de idade
      if (this.verificarMaioridade(birthDate)) {
        // Verifica se o BI está válido

        const CE = await prismaClient.client_email.findFirst({
          where: { email_address: email },
          select: { client_id: true },
          cacheStrategy: { ttl: 20 },
        });
        if (CE?.client_id) {
          await prismaClient.client.update({
            where: { client_id: CE.client_id || 0 },
            data: {
              personal_data: {
                name: name,
                birthDate: birthDate,
              },
              bi_number: biNumber,
              role_id: 1,
              address: {
                country: "Angola",
              },
              first_login: true,
            },
          });
          return response
            .status(201)
            .json({ message: "Informações adicionadas com sucesso!" });
        }
        const test = await prismaClient.client.findFirst({
          where: { bi_number: biNumber },
          select: { client_id: true },
        });
        const client = await prismaClient.client.upsert({
          where: { client_id: test?.client_id || 0 },
          create: {
            personal_data: {
              name: name,
              birthDate: birthDate,
            },
            bi_number: biNumber,
            role_id: 1,
            address: {
              country: "Angola",
            },
            first_login: true,
          },
          update: {
            personal_data: {
              name: name,
              birthDate: birthDate,
            },
            first_login: true,
          },
        });
        const client_email = await prismaClient.client_email.findFirst({
          where: { email_address: email },
          select: { email_id: true },
        });
        await prismaClient.client_email.update({
          where: { email_id: client_email?.email_id },
          data: {
            client_id: client.client_id,
          },
        });
        return response
          .status(201)
          .json({ message: "Informações adicionadas com sucesso!" });
      }
      return response.status(200).json({ message: "Menor de idade!" });
    } catch (error) {
      console.error(error);
      return response
        .status(500)
        .json({ message: "Ocorreu um erro ao processar a solicitação." });
    }
  }

  // Executa o upload dos dados
  execute(data: any, response: Response) {
    this.uploadData(data, response);
  }
}
