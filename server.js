const express = require('express');
const app = express();
app.use(express.json());

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const body = req.body;
  const signal   = body.signal   || 'UNKNOWN';
  const pair     = body.pair     || 'UNKNOWN';
  const tf       = body.tf       || '5M';
  const time_utc = body.time_utc || new Date().toUTCString();
  const price    = body.price    || '';

  const isBuy = signal.toLowerCase().includes('demand') || signal.toLowerCase().includes('buy');
  const emoji = isBuy ? '🚀' : '🔻';
  const color = isBuy ? 3066993 : 15158332; // green : red in decimal

  const discordPayload = {
    username: 'LSD Zone Detector',
    avatar_url: 'https://i.imgur.com/AfFp7pu.png',
    embeds: [{
      title: `${emoji} ${signal.toUpperCase()}`,
      color: color,
      fields: [
        { name: 'Pair',      value: `\`${pair}\``,     inline: true },
        { name: 'Timeframe', value: `\`${tf}\``,       inline: true },
        { name: 'Price',     value: `\`${price}\``,    inline: true },
        { name: 'Time (UTC)',value: `\`${time_utc}\``, inline: false }
      ],
      footer: { text: 'LSD Zone Detector V4.3 — Manual review required' },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
    console.log('Alert sent:', signal, pair);
  } catch (err) {
    console.error('Failed to send alert:', err);
  }
});

app.get('/', (req, res) => res.send('LSD Alert Server is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
