const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config/config.json');
const dataPath = path.join(__dirname, '..', 'data.json');

function loadRegeln() {
    try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return [];
    }
}

async function updateRegelListe(guild) {
    try {
        const regeln = loadRegeln();
        const regelwerkChannel = await guild.channels.fetch(config.channels.regelwerk).catch(() => null);

        if (!regelwerkChannel) return;

        if (!regeln.length) return;

        const embed = new EmbedBuilder()
            .setTitle("📜 Regelwerk")
            .setColor(0xf5d442)
            .setImage(config.regelwerkbanner)
            .setDescription(
                regeln.map(r => `**#${r.nummer}:** ${r.text}`).join('\n\n') +
                `\n\n*Fragen? → <#${config.channels.erklaerung}>*`
            )
            .setFooter({ text: `${new Date().toLocaleString("de-DE")} | ${config.autor}` });

        // Letzte Nachricht im Channel fetchen
        const messages = await regelwerkChannel.messages.fetch({ limit: 1 });
        const lastMsg = messages.first();

        if (lastMsg && lastMsg.author.id === guild.client.user.id) {
            // Wenn letzte Nachricht vom Bot ist, editieren
            await lastMsg.edit({ embeds: [embed] });
        } else {
            // Sonst neue Nachricht senden
            await regelwerkChannel.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error('Update-Fehler:', e);
    }
}

module.exports = {
    data: {
        name: 'regel-liste',
        description: 'Zeigt die Regelliste',
    },

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRole)) {
            return interaction.reply({
                content: '❌ Keine Berechtigung.',
                ephemeral: true
            });
        }

        let regeln = loadRegeln();

        if (!regeln.length) {
            return interaction.reply({
                content: '⚠️ Keine Regeln vorhanden.',
                ephemeral: true
            });
        }

        await updateRegelListe(interaction.guild);

        return interaction.reply({
            content: '✅ Regelliste aktualisiert.',
            ephemeral: true
        });
    },

    updateRegelListe
};