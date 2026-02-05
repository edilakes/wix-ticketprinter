const axios = require('axios');
require('dotenv').config();

const config = {
  apiKey: process.env.WIX_API_KEY,
  siteId: process.env.WIX_SITE_ID,
  prefix: process.env.PREFIX || '142B',
  receiptsUrl: 'https://www.wixapis.com/receipts/v1/receipts'
};

async function queryReceipt(displayNumber) {
  if (!config.apiKey || !config.siteId) {
    throw new Error('❌ Configura WIX_API_KEY y WIX_SITE_ID en .env');
  }

  try {
    const response = await axios.post(config.receiptsUrl, {
      query: {}
    }, {
      headers: {
        'Authorization': config.apiKey,
        'Content-Type': 'application/json',
        'wix-site-id': config.siteId
      },
      timeout: 10000
    });

    const receipts = response.data.receipts || [];
    const ticket = receipts.find(r => r.numbering?.displayNumber === displayNumber);
    
    if (!ticket) {
      throw new Error(`Ticket ${displayNumber} no encontrado`);
    }
    
    return ticket;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('❌ API Key inválida');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('⏰ Timeout - Verifica tu conexión');
    }
    throw error;
  }
}

async function printTicket(displayNumber) {
  const ticket = await queryReceipt(displayNumber);
  await require('./printer').generatePdf(ticket, true);
}

async function getTicketJson(displayNumber) {
  return await queryReceipt(displayNumber);
}

async function listTickets(limit = 10) {
  // Implementación para listar
  const ticket = await queryReceipt(`${config.prefix}1`);
  console.log('📋 Últimos tickets:', [ticket.numbering?.displayNumber]);
}

module.exports = {
  printTicket,
  getTicketJson,
  listTickets,
  queryReceipt
};
