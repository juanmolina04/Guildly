require('dotenv').config();
const os = require('os');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Guildly API escuchando en el puerto ${PORT}`);
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const a of addresses || []) {
      if (a.family === 'IPv4' && !a.internal) console.log(`  -> http://${a.address}:${PORT}/api/health`);
    }
  }
});
