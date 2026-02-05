const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PDF_HEIGHT = process.env.PDF_HEIGHT || 297; // mm

async function generatePdf(ticketData, printDirect = false) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Tu HTML del ticket adaptado
  const ticketHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 11pt; 
          margin: 0; 
          padding: 8mm; 
          width: 80mm;
          background: white;
        }
        .header { text-align: center; border-bottom: 3px dashed #333; padding-bottom: 12px; margin-bottom: 12px; }
        .productos { margin: 12px 0; }
        .total { font-size: 14pt; font-weight: 900; }
        hr { border: 1px dashed #666; margin: 12px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="font-size: 16pt; font-weight: 900;">${ticketData.businessDetails?.name || 'WIX'}</div>
        <div>${ticketData.businessDetails?.address?.formattedAddress || ''}</div>
      </div>
      
      <div style="font-size: 10pt;">
        <strong>TICKET:</strong> ${ticketData.numbering?.displayNumber}<br>
        <strong>FECHA:</strong> ${new Date(ticketData.createdDate).toLocaleString('es-ES')}
      </div>
      
      <hr>
      
      ${ticketData.lineItems?.map(item => `
        <div class="productos">
          <div style="font-weight: 700;">${item.name}</div>
          <div style="display: flex; justify-content: space-between;">
            <span>${item.quantity}x ${parseFloat(item.price).toFixed(2)}€</span>
            <span>${parseFloat(item.totals?.totalPriceAfterTax || 0).toFixed(2)}€</span>
          </div>
        </div>
      `).join('') || ''}
      
      <hr style="border: 2px solid #333;">
      
      <div class="total" style="display: flex; justify-content: space-between;">
        <span>TOTAL:</span>
        <span>${parseFloat(ticketData.totals?.total || 0).toFixed(2)}€</span>
      </div>
      
      <div style="margin-top: 24px; text-align: center; font-weight: 700;">
        ¡GRACIAS POR SU COMPRA!
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(ticketHtml, { waitUntil: 'networkidle0' });
  
  const filename = `ticket_${ticketData.numbering?.displayNumber || Date.now()}.pdf`;
  const pdfPath = path.join(process.cwd(), filename);
  
  const pdfBuffer = await page.pdf({
    format: 'A6',
    printBackground: true,
    margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
  });
  
  fs.writeFileSync(pdfPath, pdfBuffer);
  
  await browser.close();
  
  if (printDirect) {
    // Opcional: enviar a impresora predeterminada
    console.log(`🖨️ Enviando a impresora: ${pdfPath}`);
  }
  
  return pdfPath;
}

module.exports = { generatePdf };
