const fs = require('fs');
const path = require('path');
const { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/config.json');
const dataPath = path.join(__dirname, '..', 'data.json');

function loadRegeln() {
    try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return [];
    }
}

async function updatePanel(guild) {
    try {
        const erklaerungChannel = await guild.channels.fetch(config.channels.erklaerung).catch(() => null);
        if (!erklaerungChannel) return;

        let regeln = loadRegeln();
        if (!regeln.length) return;

        const menu = new StringSelectMenuBuilder()
            .setCustomId('regel_auswahl')
            .setPlaceholder('Wähle eine Regel...')
            .addOptions(
                regeln.slice(0, 25).map(regel => ({
                    label: `#${regel.nummer}`,
                    description: regel.text.length > 80 ? regel.text.slice(0, 77) + "..." : regel.text,
                    value: regel.nummer.toString()
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("Regel erklärt")
            .setDescription("Wähle eine Regel → Erklärung kommt **privat** zu dir!")
            .setImage(config.regelwerkerklärungbanner)
            .setColor(0x3498db);

        // Letzte Nachricht im Channel fetchen
        const messages = await erklaerungChannel.messages.fetch({ limit: 1 });
        const lastMsg = messages.first();

        if (lastMsg && lastMsg.author.id === guild.client.user.id) {
            // Wenn letzte Nachricht vom Bot ist, editieren
            await lastMsg.edit({ embeds: [embed], components: [row] });
        } else {
            // Sonst neue Nachricht senden
            await erklaerungChannel.send({ embeds: [embed], components: [row] });
        }
    } catch (e) {
        console.error('Panel-Update Fehler:', e);
    }
}

module.exports = {
    data: {
        name: 'regel-erklaeren',
        description: 'Erkläre eine Regel',
    },

    async execute(interaction) {
        let regeln = loadRegeln();

        if (!regeln.length) {
            return interaction.reply({
                content: '⚠️ Keine Regeln vorhanden.'
            });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('regel_auswahl')
            .setPlaceholder('Wähle eine Regel...')
            .addOptions(
                regeln.slice(0, 25).map(regel => ({
                    label: `#${regel.nummer}`,
                    description: regel.text.length > 80 ? regel.text.slice(0, 77) + "..." : regel.text,
                    value: regel.nummer.toString()
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("Regel erklärt")
            .setDescription("Wähle eine Regel → Erklärung kommt **privat** zu dir!")
            .setImage(config.regelwerkerklärungbanner)
            .setColor(0x3498db);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },

    async handleSelect(interaction) {
        if (interaction.customId !== 'regel_auswahl') return;

        const regelNummer = parseInt(interaction.values[0]);
        let regeln = loadRegeln();
        const regel = regeln.find(r => r.nummer === regelNummer);

        if (!regel) {
            return interaction.reply({
                content: '❌ Regel nicht gefunden.',
                ephemeral: true
            });
        }

        return interaction.reply({
            content: `**Erklärung zu Regel #${regel.nummer}:**\n${regel.erklaerung}`,
            ephemeral: true
        });
    },

    updatePanel
};