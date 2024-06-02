import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import { ColorTypes, PDFDocument, StandardFonts, rgb } from 'pdf-lib';
const fs = require('fs');

export class generatePDF{


  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  formatTimestamp2(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  
  formatCurrency(amount: number): string {
    return `KZ ${amount.toLocaleString('pt-PT')}`;
  }

  async generate(type: number, transactionId: number, data: {date1: string, date2: string}, response: Response) {
    try {
      switch(type){
        case 1: {
          
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}, cacheStrategy: { ttl: 1 }})
          
          const account = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountTo || ""}})
          const accountFrom = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountFrom}})
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
          //Transferência recebida
          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição do emissor: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.emissor_description}`, {
                x: 195 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB do emissor: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountFrom}`, {
                x: 163 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Transferêencia à crédito', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
        }
        case 2: {
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}, cacheStrategy: { ttl: 1 }})
          
          // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
          let  accountFrom 
          if (transaction?.type === 1) {
            accountFrom = await  prismaClient.account.findFirst({where: {account_nbi: transaction?.accountTo || ""}})
          }
          if (
            transaction?.type === 2
          ) {
            accountFrom = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountTo }})
          }
          const account = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountFrom }}) 
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
          //Transferência enviada
          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição do benefíciário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.receptor_description}`, {
                x: 215 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB do beneficiário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountTo}`, {
                x: 175 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Transferêencia à débito', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }


        }
        case 3: {
          //Transferência Express recebida
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}, cacheStrategy: { ttl: 1 }})
          const account = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountFrom || ""}})
          const entity = await prismaClient.entity.findFirst({where: {reference: transaction?.accountTo || ""}, cacheStrategy: { ttl: 1 }})
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição do benefíciário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.receptor_description}`, {
                x: 195 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB do beneficiário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountTo}`, {
                x: 163 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Transferência à crédito', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
          
        }
        case 4: {
          //Transferência Express enviada
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}})
          const account = await prismaClient.account.findFirst({where: {account_number: transaction?.accountFrom || ""}})
          const upmoney = await prismaClient.upmoney.findFirst({where: {transferId: transaction?.id}})
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição do benefíciário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.receptor_description}`, {
                x: 195 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB do beneficiário: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountTo}`, {
                x: 163 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Transferêecia à débito', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
          
        }
        case 5: {
          //Pagamento de serviço
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}, cacheStrategy: { ttl: 1 }})
          const account = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountFrom || ""}})
          const entity = await prismaClient.entity.findFirst({where: {reference: transaction?.accountTo || ""}, cacheStrategy: { ttl: 1 }})
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}
          
          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number?.replace(".", " ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição da Entidade: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.receptor_description}`, {
                x: 195 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Referência da Entidade: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountTo}`, {
                x: 200 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Pagamento de serviço', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF", error})
          }
        }
        case 6: {
          //Pagamento por referência
          const transaction = await prismaClient.transfers.findFirst({where: {id: transactionId}, cacheStrategy: { ttl: 1 }})
          const account = await prismaClient.account.findFirst({where: {account_nbi: transaction?.accountFrom || ""}})
          const entity = await prismaClient.entity.findFirst({where: {reference: transaction?.accountTo || ""}, cacheStrategy: { ttl: 1 }})
          const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
          const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}

          try {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('A operação efetuada foi registada com sucesso pelo serviço BFA NET.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Nome: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${name.name?.join(" ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_number?.replace(".", " ")}`, {
                x: 115 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados do movimento', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Descrição da Entidade: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.receptor_description}`, {
                x: 195 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB da Entidade: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.accountTo}`, {
                x: 163 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.transfer_description}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(transaction?.date || ""))}`, {
                x: 107 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Montante: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(transaction?.balance?.toString() || ""))}`, {
                x: 130 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Número da operação: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${transaction?.id}`, {
                x: 190 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de movimento: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('Pagamento por referência', {
                x: 177 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 10; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 170;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Movimento ${transaction?.id}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
        }
        case 7: {
          try {

            const account = await prismaClient.account.findFirst({where: {account_number: transactionId.toString().replace('30001', '.30.001')}})
            const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, cacheStrategy: { ttl: 1 }})
            const name: {name: string[], birthDate: string} = client?.personal_data as {name: string[], birthDate: string}

            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 10;
            const fontSizeTitle = 12;
            const lineHeight = 30; 


              let y = height - 50;
              page.drawText('Extrato de conta.', {
                x: 50,
                y: y,
                size: 12,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 40; // Espaçamento adicional para títulos
              page.drawText('Dados da conta', {
                x: 50,
                y: y,
                size: fontSizeTitle,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('Número da conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
                page.drawText(`${account?.account_number}`, {
                x: 170 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('IBAN: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(` ${account?.account_iban}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('NIB: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_nbi}`, {
                x: 110 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 30;
              page.drawText('BIC/SWIFT: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.bic}`, {
                x: 140 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Moeda: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.currency}`, {
                x: 125 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Tipo de conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.account_role === 1 ? "Conta à Ordem" : "Conta Simplificada P/ Comerciantes"} `, {
                x: 155 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Data de abertura: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatTimestamp(parseInt(account?.created_at || ""))}`, {
                x: 160 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Estado da conta: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${account?.state}`, {
                x: 165 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Saldo contabilístico: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(account?.available_balance?.toString() || ""))}`, {
                x: 180 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Saldo autirzado: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${this.formatCurrency(parseFloat(account?.authorized_balance?.toString() || ""))}`, {
                x: 160 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Titular: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${name.name?.join(" ")}`, {
                x: 120 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('BI: ', {
                x: 80 + 20,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText(`${client?.bi_number}`, {
                x: 100 + 20,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight + 60; // Espaçamento adicional para seções
              page.drawText(`Documento processado pelo BFA NET em ${this.formatTimestamp(Date.now())}`, {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= lineHeight;
              page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 25;
              page.drawText('BFA, consigo a construir o futuro.', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              y -= 120;
              page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              y -= 15;
              page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
                x: 57,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

        
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
        
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
        
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Conta N_${account?.account_number}.pdf`);
            return response.send(pdfBuffer)
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
        }
        case 8: {
          try {
            
            const account = await prismaClient.account.findFirst({where: {account_number: transactionId.toString().replace('30001', '.30.001')}})
            const transactions = await prismaClient.transfers.findMany({
              where: {
                AND: [
                  {
                    OR: [
                      { accountFrom: account?.account_nbi },
                      { accountTo: account?.account_nbi },
                    ]
                  }
                ]
              }
            });
            
            const client = await prismaClient.client.findFirst({
              where: { client_id: account?.client_id || 0 },
              cacheStrategy: { ttl: 1 },
            });
            const name: { name: string[], birthDate: string } = client?.personal_data as { name: string[], birthDate: string };
            const black = rgb(0, 0, 0);
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { height } = page.getSize();
            const fontSize = 8;
            const fontSizeTitle = 10;
            const lineHeight = 20;
          
            let y = height - 50;
            page.drawText('Extrato de movimentos.', {
              x: 50,
              y: y,
              size: 10,
              font: timesRomanBoldFont,
              color: black,
            });
          
            y -= lineHeight + 40; // Espaçamento adicional para títulos
            page.drawText('Dados da conta', {
              x: 50,
              y: y,
              size: fontSizeTitle,
              font: timesRomanBoldFont,
              color: black,
            });
          
            y -= 30;
            page.drawText('Nome: ', {
              x: 100,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText(`${name.name?.join(" ")}`, {
              x: 135,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= lineHeight;
            page.drawText('Conta: ', {
              x: 100,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText(` ${account?.account_number?.replace(".", " ")}`, {
              x: 135,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= lineHeight;
            page.drawText('NIB: ', {
              x: 100,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText(`${account?.account_nbi}`, {
              x: 130,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= 50;
            page.drawText('Movimentos', {
              x: 50,
              y: y,
              size: fontSizeTitle,
              font: timesRomanBoldFont,
              color: black,
            });
          
            y -= 20;
            page.drawLine({
              start: { x: 50, y: y },
              end: { x: 550, y: y },
              thickness: 1, // Espessura da linha
              color: black,
            });
          
            y -= 20;
            page.drawText('Data', {
              x: 50,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText('Descritivo', {
              x: 100,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText('Débito', {
              x: 360,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText('Crédito', {
              x: 430,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
            page.drawText('Saldo AP/M', {
              x: 500,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
          
            for (const transaction of transactions) {
              if (transaction.status === 'Finalizada') {
                y -= 20;
              page.drawText(this.formatTime(parseInt(transaction.date || "")), {
                x: 50,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: black,
              });
              page.drawText(transaction.type === 7 ? `Pagamento de serviço - Entidade ${transaction.accountTo} - ${transaction.receptor_description}` : transaction.type === 9 ? `Pagamento por referência - Ref. ${transaction.transfer_description}` : transaction.transfer_description || "", {
                x: 100,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: black,
              });
              page.drawText(transaction.accountFrom === account?.account_nbi ? (this.formatCurrency(parseInt(transaction?.balance?.toString() || ""))) : '', {
                x: 360,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: black,
              });
              page.drawText(transaction.accountTo === account?.account_nbi ? (this.formatCurrency(parseInt(transaction?.balance?.toString() || ""))) : '', {
                x: 430,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: black,
              });
              page.drawText(this.formatCurrency(parseInt(transaction?.pos_balance?.toString() || "")), {
                x: 500,
                y: y,
                size: fontSize,
                font: timesRomanFont,
                color: black,
              });
              }
              else {
                
              }
            }
          
            y -= lineHeight + 60; // Espaçamento adicional para seções
            page.drawText(`Documento processado pelo BFA NET em ${new Date().toLocaleString()}`, {
              x: 50,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= lineHeight;
            page.drawText('Caso necessite de obter alguma informação adicional, contacte o Linha de Atendimento ao Cliente', {
              x: 50,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= 15;
            page.drawText('disponível todos os dias do ano pelos telefones (+244) 923 120 120 e/ou pelo e-mail bfa@bfa.ao.', {
              x: 50,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= 25;
            page.drawText('BFA, consigo a construir o futuro.', {
              x: 50,
              y: y,
              size: fontSize,
              font: timesRomanBoldFont,
              color: black,
            });
          
            y -= 120;
            page.drawText('Banco de Fomento Angola, SA | Sede Social: Rua Amílcar Cabral no 58, Maianga, Luanda', {
              x: 130,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= 15;
            page.drawText('Sociedade Anónima, Capital Social 15.000.000.000 AKZ | Contribuinte: 5410 003 691 | SWIFT/ BIC: BFMXAOLU', {
              x: 90,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            y -= 15;
            page.drawText('Telefone +244 222 638 900 | Linha de Atendimento BFA +244 923 120 120 | e-mail: bfa@bfa.ao | www.bfa.ao', {
              x: 100,
              y: y,
              size: fontSize,
              font: timesRomanFont,
              color: black,
            });
          
            // Serializa o documento para bytes
            const pdfBytes = await pdfDoc.save();
          
            // Cria um buffer a partir dos bytes do PDF
            const pdfBuffer = Buffer.from(pdfBytes);
          
            // Retorna o PDF como um buffer na resposta
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=Extrato_de_Movimentos_${Date.now()}.pdf`);
            return response.send(pdfBuffer);
          } catch (error) {
            return response.status(200).json({sucess: false, message: "Falha ao gerar PDF"})
          }
        }
        default: {
          break;
        }
        
      }
    }
    catch(err) {
      console.log(err)
      return response.status(200).json({success: false, message: err})
    }
  }
  
  execute(request: Request, response: Response) {
    const type = request.params.type
    const transactionId = request.params.transactionId
    const teste = type.toString().split('.')
    const data = {date1:teste[1], date2: teste[2]}
    this.generate(parseInt(type), parseInt(transactionId), data, response)
  }
}