import { type Request, type Response, Router } from "express";
import { VerifyPhoneController } from "../modules/verify-phone/verify-phone.controller";
import { VerifyOTPController } from "../modules/verify-otp/verify-otp.controller";
import { PersonalDataController } from "../modules/personal-data/personal-data.controller";
import { uploadMulter, uploadB2 } from "../middlewares/middleware";
import { GetBICOntroller } from "../modules/getBI/getBI.controller";

const router = Router()

router.get('/', async(resquest: Request, response: Response)=>{
    response.status(200).json({message: 'Server Running'})
})

router.post("/verify-phone", async (request: Request, response: Response)=>{
    const {phone} = request.body
    if (!phone) {
        response.status(422).json({
            message: 'Not provided data'
        })
    }
    else {
        new VerifyPhoneController().handle(request, response, phone)
    }
})

router.post("/verify-otp", async (request: Request, response: Response)=>{
    const {phone, otp_code} = request.body
    if (!phone || !otp_code){
        response.status(422).json({
            message: 'Not provided data'
        })
    }
    else {
        new VerifyOTPController().handle(request, response, phone, otp_code)
    }
})

router.post("/upload/:phone/:imageRole", uploadMulter, uploadB2,async (request: Request, response: Response)=>{
    response.status(200).json({message: "Imagem carregada com sucesso!"})
})

router.post("/personal-data", async(request: Request, response: Response)=>{
    if (!request.body) {
        response.status(422).json({
            message: 'Not provided data'
        })
    }
    else {
        new PersonalDataController().handle(request.body, request, response)
    }
})

router.get('/getBI/:phone', async(request: Request, response: Response)=>{
    new GetBICOntroller().handle(request, response, request.body)
})

export {router}