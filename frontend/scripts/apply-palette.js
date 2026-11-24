// Cambia la paleta de Guildly a: #15370d (verde oscuro), #728e6d (salvia), #e5cd82 (arena), #fff2b4 (crema).
// Uso (desde la carpeta frontend):  node scripts/apply-palette.js
// Es seguro ejecutarlo una sola vez; si lo repites no hace nada porque ya no encuentra los colores viejos.
const fs = require('fs');
const path = require('path');

const MAP = {
  '#15151b': '#15370d', // fondo oscuro / texto principal
  '#18181d': '#15370d',
  '#24242b': '#1d4513',
  '#1f1f27': '#1d4513', // tarjetas oscuras
  '#f2bf4b': '#e5cd82', // acento (antes dorado)
  '#bd8615': '#4f6f4a', // acento sobre fondo claro
  '#d59615': '#9a7b1c', // estrellas / rating
  '#f4f4f6': '#fff8dc', // fondo de pantallas
  '#f9f9fb': '#fffbe8',
  '#fbf0d3': '#f6ecc0',
  '#e3e3e8': '#dccf9a', // bordes
  '#d9d9df': '#dccf9a',
  '#777781': '#6b7f66', // textos secundarios
  '#8b8b96': '#7f9079',
  '#686873': '#5d7258',
  '#555560': '#3d5736',
  '#41414a': '#2f4a28',
  '#a9a9b2': '#b9c9b2', // texto de navegación sobre fondo oscuro
  '#b4b4be': '#c8d4c2',
  '#5ad1c4': '#728e6d', // acento secundario
};

const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(name)) files.push(full);
  }
})(path.join(__dirname, '..', 'src'));

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => MAP[hex.toLowerCase()] ?? hex);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed++;
    console.log('actualizado', path.relative(path.join(__dirname, '..'), file));
  }
}
console.log(`Listo: ${changed} archivos.`);
