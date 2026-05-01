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
        name: 'regel-add',
        description: 'Fügt eine neue Regel hinzu',
        options: [
            { name: 'nummer', description: 'Regelnummer', type: 4, required: true },
            { name: 'text', description: 'Regeltext', type: 3, required: true },
            { name: 'erklaerung', description: 'Erklärung (optional)', type: 3, required: false }
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
        const text = interaction.options.getString('text');
        const erklaerung = interaction.options.getString('erklaerung') || text;

        let regeln = loadRegeln();

        if (regeln.some(r => r.nummer === nummer)) {
            return interaction.reply({
                content: `❗ Regel #${nummer} existiert bereits.`,
                ephemeral: true
            });
        }

        regeln.push({ nummer, text, erklaerung });
        regeln.sort((a, b) => a.nummer - b.nummer);

        if (!saveRegeln(regeln)) {
            return interaction.reply({
                content: '❌ Fehler beim Speichern.',
                ephemeral: true
            });
        }

        await sendAdminNotify(
            interaction.guild,
            '🆕 Regel hinzugefügt',
            `**#${nummer}** von <@${interaction.user.id}>\n${text}`,
            0x4caf50
        );

        return interaction.reply({
            content: `✅ Regel **#${nummer}** hinzugefügt und aktualisiert.`,
            ephemeral: true
        });
    }
};