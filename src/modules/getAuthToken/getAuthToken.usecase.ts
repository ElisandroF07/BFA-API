import { Response, Request } from "express";
import B2 from "backblaze-b2";

export class GetAuthTokenUseCase {

  async getToken(response: Response){
    try {
      const b2 = new B2({
        applicationKeyId: process.env.KEY_ID || "",
        applicationKey: process.env.APP_KEY || "",
      });
    
      const authResponse = await b2.authorize();
      return response.status(200).json(authResponse.data.authorizationToken)
    }
    catch(err){
      return response.status(500).json({message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde."})
    }
  }

  async execute(request: Request, response: Response) {
    await this.getToken(response)
  }
}