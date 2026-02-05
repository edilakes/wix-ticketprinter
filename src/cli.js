#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const { printTicket, listTickets, getTicketJson } = require('./api');
const { generatePdf } = require('./printer');
const { configInteractive } = require('./utils');

program
  .name('wix-ticketprinter')
  .description(chalk.cyan('🖨️ CLI para tickets térmicos Wix 80mm'))
  .version('1.0.0');

program
  .command('print <numero>')
  .description('🖨️ Imprime ticket directamente')
  .action(async (numero) => {
    try {
      console.log(chalk.yellow(`🔍 Buscando ticket ${numero}...`));
      await printTicket(numero);
      console.log(chalk.green('✅ Ticket impreso correctamente'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

program
  .command('pdf <numero>')
  .description('📄 Genera PDF 80mm')
  .action(async (numero) => {
    try {
      console.log(chalk.yellow(`📄 Generando PDF para ${numero}...`));
      const pdfPath = await generatePdf(numero);
      console.log(chalk.green(`✅ PDF guardado: ${pdfPath}`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

program
  .command('json <numero>')
  .description('📋 Muestra JSON del ticket')
  .action(async (numero) => {
    try {
      const ticket = await getTicketJson(numero);
      console.log(JSON.stringify(ticket, null, 2));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

program
  .command('list')
  .description('📋 Lista últimos 10 tickets')
  .action(async () => {
    try {
      await listTickets();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

program
  .command('config')
  .description('⚙️ Configuración interactiva')
  .action(configInteractive);

program.parse();
