const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', msg => {
    if (msg.body.toLowerCase().includes("price")) {
        msg.reply("Our price starts from $99/month.");
    }
    if (msg.body.toLowerCase().includes("order")) {
        msg.reply("Thanks! Please send your details in DM.");
    }
});

client.initialize();
