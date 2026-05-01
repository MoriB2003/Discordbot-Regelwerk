const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const config = require('../config/config.json');

const token = config.token;

if (!token) {
    console.error('❌ FEHLER: Token nicht in config.json gesetzt!');
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online als ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);

            if (['regel-add', 'regel-edit', 'regel-remove'].includes(interaction.commandName)) {
                const regelListeCmd = client.commands.get('regel-liste');
                const regelErklarenCmd = client.commands.get('regel-erklaeren');
                
                if (regelListeCmd?.updateRegelListe) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await regelListeCmd.updateRegelListe(interaction.guild);
                }

                if (regelErklarenCmd?.updatePanel) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await regelErklarenCmd.updatePanel(interaction.guild);
                }
            }
        } catch (err) {
            console.error(err);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Fehler beim Ausführen.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Fehler beim Ausführen.', ephemeral: true });
            }
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'regel_auswahl') {
        const regelCmd = client.commands.get('regel-erklaeren');
        if (regelCmd?.handleSelect) {
            try {
                await regelCmd.handleSelect(interaction);
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: '❌ Fehler.', ephemeral: true });
            }
        }
    }
});

client.login(token);