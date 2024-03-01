import { Response } from 'express';
import nodemailer, { Transporter } from 'nodemailer';

module.exports = async (email: string, subject: string, account_number: string, account_iban: string, card_number: string, created_at: string, membershipNumber: string, accessCode: string, card_pin: string) => {
   
        const transporter: Transporter = nodemailer.createTransport({
            service: process.env.SERVICE_EMAIL,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL
            }
        });
        
        await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject: subject,
            html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
                    <h1 style="color: #ff6600;">Dados da Conta BFA NET</h1>
                    <p style="margin-bottom: 20px;">Abaixo estão os seus dados bancários do BFA NET:</p>
                    
                    <p><strong>Número da Conta:  </strong>${account_number}</p>
                    <p><strong>IBAN da Conta:  </strong> ${account_iban}</p>
                    <p><strong>Número do Cartão:  </strong>${card_number}</p>
                    <p><strong>PIN do Cartão:  </strong> <span style="color: #000; padding: 3px; border-radius: 3px;">${card_pin}</span> (Este é um dado sensível, não compartilhe com ninguém)</p>
                    
                    <p style="margin-top: 20px;">Se precisar de ajuda, entre em contacto com o nosso suporte em <a href="https://www.bfa.ao/pt/particulares/apoio-ao-cliente/linha-de-atendimento-bfa/" style="color: #ff6600; text-decoration: underline;">Linha de Atendimento do BFA</a>.</p>
                    
                    <p style="margin-top: 40px;"><strong>Número de Adesão:  </strong>${membershipNumber}</p>
                    <p><strong>Código de Acesso:  </strong> ${accessCode}</p>
                    <a href="http://localhost:3000/login" style="display: inline-block; padding: 10px 20px; background-color: #ff6600; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Login BFA NET</a>
                </div>
                `
        });
        
};
