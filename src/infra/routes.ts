import { type Request, type Response, Router } from "express";
import { PersonalDataController } from "../modules/personal-data/personal-data.controller";
import { uploadMulter, uploadB2 } from "../middlewares/middleware";
import { GetBICOntroller } from "../modules/getBI/getBI.controller";
import { VerifyEmailController } from "../modules/verify-email/verify-email.controller";
import { VerifyTokenController } from "../modules/verify-token/verify-token.controller";
import { ResendEmailController } from "../modules/resend-email/resend-email.controller";
import { GenerateCredentialsController } from "../modules/generateCredentials/generateCredential.controller";
import { LoginController } from "../modules/login/login.controller";

const router = Router()

router.get('/', async(resquest: Request, response: Response)=>{
    response.status(200).json({message: 'Server Running'})
})

router.post("/upload/:email/:imageRole", uploadMulter, uploadB2,async (request: Request, response: Response)=>{
    response.status(200).json({message: "Imagem carregada com sucesso!"})
})

router.post("/personal-data", async(request: Request, response: Response)=>{
    if (!request.body) {
        response.status(422).json({
            message: 'Not provided data'
        })
    }
    else {       
        new PersonalDataController().handle(request.body, response)
    }
})

router.get('/getBI/:email', async(request: Request, response: Response)=>{
    new GetBICOntroller().handle(request, response, request.body)
})

router.get('/sendEmail/:email', async(request: Request, response: Response)=>{
    new VerifyEmailController().handle(response, request)
})

router.get('/email/:email/verify/:token', async(request: Request, response: Response)=>{
    new VerifyTokenController().handle(response, request)
})

router.get('/resendEmail/:email', async(request: Request, response: Response)=>{
    new ResendEmailController().handle(response, request)
})

router.get('/generateCredentials/:email', async(request: Request, response: Response)=>{
    new GenerateCredentialsController().handle(request, response)
})

router.post('/login', async(request: Request, response: Response)=>{
    new LoginController().handle(request.body, response)
})

export {router}