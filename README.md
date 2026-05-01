# 🌴 Long Beach City Regelwerk-Bot

Ein Discord-Bot für einfaches Verwalten und Erklären von Serverregeln.

## 🚀 Features

- `/regel-add` – Neue Regel hinzufügen
- `/regel-edit` – Regel bearbeiten
- `/regel-remove` – Regel löschen
- `/regel-liste` – Alle Regeln anzeigen
- `/regel-erklaeren` – Regel privat erklären lassen
- **Admin-Benachrichtigungen** bei Änderungen

## 📁 Struktur

```
regelwerk-bot/
├── config/config.json
├── src/
│   ├── commands/
│   ├── data.json
│   ├── deploy-commands.js
│   └── index.js
└── package.json
```

## 🛠️ Setup

```bash
npm install
# Trage Token in config/config.json ein
Terminal öffnen und das reinschreiben

npm run deploy -für die / aktualiesieren
npm start 
```

## 📝 Commands

| Befehl | Beschreibung |
|--------|-------------|
| `/regel-add` | Neue Regel mit Nummer, Text & Erklärung |
| `/regel-edit` | Regel bearbeiten |
| `/regel-remove` | Regel löschen |
| `/regel-liste` | Alle Regeln anzeigen |
| `/regel-erklaeren` | Menü zur Regel-Erklärung |

Beispiel: /regel-add [Nummer][Text]erklärung
Beispiel: /regel-edit [Nummer][Text]erklärung
Beispiel: /regel-remove [Nummer]

**Admin-Only:** Add, Edit, Remove, Liste

❤️ Made by XxMoriBxX 
# Bitte aus Respect Nichts ändern danke 