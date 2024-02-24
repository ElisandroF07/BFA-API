import { PrismaClient } from '@prisma/client'
import { Response } from 'express';
import { formatISO } from 'date-fns';
require('dotenv').config()
const accountSid = "AC38f48917b06eb201e62eb728548b4f46"
const authToken = "aa1529d911b4654cc170cf33d5ae7e1a"
const messagingServiceSid = "MG7d861d8c98b62dba671755f701b8e778"
const twilioClient = require('twilio')(accountSid, authToken); 
const prismaClient = new PrismaClient()
const bcrypt = require('bcryptjs')

export class VerifyPhoneUseCase {
    
    contructor() {}
    
    generateOTP() {
        const digits = '0123456789';
        var OTP = '';
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP
    }

    async encrypt(OTP: string) {
        const salt = await bcrypt.genSalt(12)
        const OTPHash = await bcrypt.hash(OTP, salt)
        return OTPHash 
    }

    async sendOTP(phone_number: number, response: Response, OTP: string): Promise<void> {
        
        await twilioClient.messages
        .create({
            body: `Olá! O seu código de verificação do BFA é ${OTP}. Não compartilhe este código com ninguém!`,
            messagingServiceSid: messagingServiceSid,
            to: phone_number
        })
        .then(() => {
            console.log('foi')
        })
        .catch((err:any) => {
            console.log('erro')
        });
        
    }
    
    async createRegister(phone_requester: number, response: Response){
        const phone = await prismaClient.client_phones.findFirst({
            where: {
                phone_number: phone_requester
            },
            select: {
                verified: true
            }
        })
        
        if(phone){
            if (phone.verified) {
                return response.status(400).json({message: 'Este telefone já está em uso! Tente outro.'})
            }
            else {
                let OTP = this.generateOTP()
                let OTPHash = await this.encrypt(OTP)
                let date = new Date()
                try {
                    await this.sendOTP(phone_requester, response, OTP);
    
                    // Aguardar confirmação de envio da SMS antes de prosseguir
                    await prismaClient.register_requests.updateMany({
                        where: {
                            phone_number: phone_requester,
                        },
                        data : {
                            otp_code: OTPHash,
                            created_at: formatISO(date)
                        }
                    });
    
                    await prismaClient.register_requests.create({
                        data: {
                            created_at: formatISO(date),
                            otp_code: OTPHash,
                            phone_number: phone_requester,
                        }
                    });
    
                    return response.status(201).json({message: 'Código enviado para o seu telemóvel!'});
                }
                catch(err){
                    return response.status(500).json({message: 'Tente novamente mais tarde.', error_code: '#AUTHT001'})
                }
            }
        }
        else {
            const request = await prismaClient.register_requests.findFirst({
                where: {
                    phone_number: phone_requester
                }
            })
    
            if (request) {
                const status = await prismaClient.register_requests.findFirst({
                    where: {
                        phone_number: phone_requester
                    },
                    select: {
                        finished: true
                    }
                })
    
                if (!status?.finished) {
                    let OTP = this.generateOTP()
                    let OTPHash = await this.encrypt(OTP)
                    let date = new Date()
                    try {
                        await this.sendOTP(phone_requester, response, OTP);
                        await prismaClient.register_requests.updateMany({
                            where: {
                                phone_number: phone_requester,
                            },
                            data : {
                                otp_code: OTPHash,
                                created_at: formatISO(date)
                            }
                        }).then(()=>{return response.status(201).json({message: 'Código enviado para o seu telemóvel!'});})
                        .catch((err) => {console.log(err)});
                    }
                    catch(err){
                        return response.status(500).json({message: 'Tente novamente mais tarde.', error_code: '#AUTHT001'})
                    }           
                }
                else {
                    return response.status(400).json({message: 'Este telefone já está em uso! Tente outro!'})
                }
            }
            else {
                let date = new Date()
                let OTP = this.generateOTP()
                let OTPHash = await this.encrypt(OTP)
                try {
                    await this.sendOTP(phone_requester, response, OTP);
                    await prismaClient.register_requests.create({
                        data: {
                            created_at: formatISO(date),
                            otp_code: OTPHash,
                            phone_number: phone_requester,
                        }
                    }).then(()=>{return response.status(201).json({message: 'Código enviado para o seu telemóvel!'});})
                    .catch((err) => {console.log(err)});
    
                    
                }
                catch(err) {
                    return response.status(500).json({message: 'Tente novamente mais tarde.', error_code: '#AUTHT001'})
                }
            }
        }
    }
    
    async execute(phone_number: number, response: Response) {
        await this.createRegister(phone_number, response);
    }
    
}