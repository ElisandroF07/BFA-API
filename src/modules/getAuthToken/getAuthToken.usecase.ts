import { Response, Request } from "express";
import B2 from "backblaze-b2";

export class GetAuthTokenUseCase {

  async getToken(response: Response){
    try {
      // Cria uma instância do cliente B2 com as credenciais fornecidas
      const b2 = new B2({
        applicationKeyId: process.env.KEY_ID || "",
        applicationKey: process.env.APP_KEY || "",
      });
    
      // Autoriza o cliente B2 e obtém o token de autorização
      const authResponse = await b2.authorize();
      return response.status(200).json(authResponse.data.authorizationToken)
    }
    catch(err){
      // Retorna um erro caso ocorra algum problema na obtenção do token
      return response.status(500).json({message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.", error: err})
    }
  }

  async execute(request: Request, response: Response) {
    // Chama a função para obter o token de autorização
    await this.getToken(response)
  }
}
