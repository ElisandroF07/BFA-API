const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

exports.handler = async (event) => {
  // Cria um novo documento PDF
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Adiciona uma página ao documento
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  const fontSize = 30;
  page.drawText('Hello, world!', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  });

  // Serializa o documento para bytes
  const pdfBytes = await pdfDoc.save();

  // Retorna o PDF como base64
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="example.pdf"',
    },
    body: pdfBytes.toString('base64'),
    isBase64Encoded: true,
  };
};