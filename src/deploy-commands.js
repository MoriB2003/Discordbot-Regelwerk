require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config/config.json');

// Token von Environment Variable
const token = process.env.DISCORD_TOKEN || '';

if (!token) {
    console.error('❌ FEHLER: DISCORD_TOKEN nicht gesetzt!');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) commands.push(command.data);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`📤 Deploye ${commands.length} Slash-Commands...`);
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('✅ Alles deployed!');
    } catch (e) {
        console.error('❌ Fehler:', e.message);
    }
})();