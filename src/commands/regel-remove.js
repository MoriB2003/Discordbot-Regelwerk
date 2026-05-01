const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.json');
const dataPath = path.join(__dirname, '..', 'data.json');

function loadRegeln() {
    try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveRegeln(regeln) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(regeln, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function sendAdminNotify(guild, title, desc, color) {
    try {
        const ch = await guild.channels.fetch(config.channels.admin);
        if (ch) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(desc)
                .setColor(color)
                .setImage(config.regeländernbanner)
                .setTimestamp();
            await ch.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    data: {
        name: 'regel-remove',
        description: 'Löscht eine Regel',
        options: [
            { name: 'nummer', description: 'Regelnummer', type: 4, required: true }
        ]
    },

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRole)) {
            return interaction.reply({
                content: '❌ Keine Berechtigung.',
                ephemeral: true
            });
        }

        const nummer = interaction.options.getInteger('nummer');
        let regeln = loadRegeln();

        const index = regeln.findIndex(r => r.nummer === nummer);
        if (index === -1) {
            return interaction.reply({
                content: `🔎 Regel #${nummer} nicht gefunden.`,
                ephemeral: true
            });
        }

        const removed = regeln.splice(index, 1);

        if (!saveRegeln(regeln)) {
            return interaction.reply({
                content: '❌ Fehler beim Löschen.',
                ephemeral: true
            });
        }

        await sendAdminNotify(
            interaction.guild,
            '🗑️ Regel gelöscht',
            `**#${nummer}** von <@${interaction.user.id}>\n${removed[0].text}`,
            0xf44336
        );

        return interaction.reply({
            content: `✅ Regel **#${nummer}** gelöscht und aktualisiert.`,
            ephemeral: true
        });
    }
};