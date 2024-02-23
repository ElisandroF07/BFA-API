import { type Request, type Response, Router } from "express";
import { VerifyPhoneController } from "../modules/verify-phone/verify-phone.controller";
import { VerifyOTPController } from "../modules/verify-otp/verify-otp.controller";
import { PersonalDataController } from "../modules/personal-data/personal-data.controller";
import { upload } from "../middlewares/middleware";
const uploadImageMiddleware = require('../middlewares/uploadImage.middleware')

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

router.post("/upload-image/:phone/:imageRole", uploadImageMiddleware.single('image'), async (request: Request, response: Response)=>{
    response.status(201).json({message: 'Imagens carregadas com sucesso!'})
})



router.post("/upload", upload.any(), async (request: Request, response: Response)=>{

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

export {router}