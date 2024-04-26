import nodemailer, { Transporter } from "nodemailer";

// Função que envia um email de confirmação com um link de verificação
module.exports = async (email: string, subject: string, url: string) => {
    // Cria um transporte de email utilizando o nodemailer
    const transporter: Transporter = nodemailer.createTransport({
        // Configurações do serviço de email (ex: Gmail, Outlook, etc)
        service: process.env.SERVICE_EMAIL,
        // Autenticação com o serviço de email
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.PASS_EMAIL,
        },
    });

    // Envia o email utilizando o transporte configurado
    await transporter.sendMail({
        // Endereço de email remetente
        from: process.env.USER_EMAIL,
        // Endereço de email destinatário
        to: email,
        // Assunto do email
        subject: subject,
        // Corpo do email formatado em HTML
        html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
                <h1 style="color: #ff6600;">Confirme seu email</h1>
                <p style="margin-bottom: 20px;">Por favor, clique no link abaixo para verificar seu email no BFA NET:</p>
                <a href=${url} style="display: inline-block; padding: 10px 20px; background-color: #ff6600; color: #ffffff; text-decoration: none; border-radius: 5px;">Verificar Email</a>
                <p style="margin-top: 20px;">Se você não tentou realizar esta operação, entre em contacto com nosso suporte em <a href="https://www.bfa.ao/pt/particulares/apoio-ao-cliente/linha-de-atendimento-bfa/" style="color: #ff6600; text-decoration: underline;">Linha de Atendimento do BFA</a>. Por favor, não compartilhe este email com ninguém.</p>
            </div>`,
    });
};
