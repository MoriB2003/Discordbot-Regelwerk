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
        name: 'regel-edit',
        description: 'Bearbeitet eine Regel',
        options: [
            { name: 'nummer', description: 'Regelnummer', type: 4, required: true },
            { name: 'text', description: 'Neuer Text', type: 3, required: true },
            { name: 'erklaerung', description: 'Neue Erklärung (optional)', type: 3, required: false }
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
        const neuerText = interaction.options.getString('text');
        const neueErklaerung = interaction.options.getString('erklaerung') || neuerText;

        let regeln = loadRegeln();
        const regel = regeln.find(r => r.nummer === nummer);

        if (!regel) {
            return interaction.reply({
                content: `🔎 Regel #${nummer} nicht gefunden.`,
                ephemeral: true
            });
        }

        const alterText = regel.text;
        regel.text = neuerText;
        regel.erklaerung = neueErklaerung;

        if (!saveRegeln(regeln)) {
            return interaction.reply({
                content: '❌ Fehler beim Speichern.',
                ephemeral: true
            });
        }

        await sendAdminNotify(
            interaction.guild,
            '✏️ Regel bearbeitet',
            `**#${nummer}** von <@${interaction.user.id}>\n**Alt:** ${alterText}\n**Neu:** ${neuerText}`,
            0xff9800
        );

        return interaction.reply({
            content: `✅ Regel **#${nummer}** bearbeitet und aktualisiert.`,
            ephemeral: true
        });
    }
};