import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class SetCardNickname {

  async setNickname(response: Response, cardNumber: number, nickname: string) {
    try {
      // Procura o cartão com o número fornecido
      const card = await prismaClient.card.findFirst({ where: { number: cardNumber }, select: { card_id: true } });
      if (card) {
        // Atualiza o apelido (nickname) do cartão
        const resp = await prismaClient.card.update({ where: { card_id: card.card_id }, data: { nickname: nickname }, select: {nickname: true} });
        return response.status(201).json({ message: "Alterações salvas com sucesso!", nickname: resp.nickname });
      }
      // Retorna uma mensagem se o cartão não for encontrado
      return response.status(200).json({ message: "O seu pedido não pode ser processado! Tente novamente mais tarde." });
    } catch {
      // Retorna uma mensagem de erro se ocorrer algum problema durante o processo
      return response.status(500).json({ message: "O seu pedido não pode ser processado! Tente novamente mais tarde." });
    }
  }

  async execute(request: Request, response: Response) {
    // Obtém o número do cartão e o apelido (nickname) do corpo da solicitação
    const cardNumber = parseInt(request.body.cardNumber);
    const nickname = request.body.nickname;
    // Chama a função para definir o apelido do cartão
    await this.setNickname(response, cardNumber, nickname);
  }
}
