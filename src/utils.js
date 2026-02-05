const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

async function configInteractive() {
  console.log(chalk.cyan('⚙️ Configuración interactiva'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'WIX_API_KEY:',
      validate: (v) => v.length > 50 || 'API Key debe ser larga'
    },
    {
      type: 'input',
      name: 'siteId',
      message: 'WIX_SITE_ID:',
      validate: (v) => v.includes('-') || 'Debe ser un UUID válido'
    }
  ]);
  
  const envContent = `
WIX_API_KEY=${answers.apiKey}
WIX_SITE_ID=${answers.siteId}
PREFIX=142B
PDF_HEIGHT=297
  `.trim();
  
  fs.writeFileSync('.env', envContent);
  console.log(chalk.green('✅ .env creado correctamente'));
}
