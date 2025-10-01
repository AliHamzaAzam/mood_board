// Simple script to create basic tray icons using node
const fs = require('fs');

// Create a simple 16x16 PNG (orange circle - idle state)
const idlePNG = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000001000000010080600000' +
  '01ff3ff610000001c4944415478da' +
  // Simplified PNG data for an orange/amber circle
  '62f8cf400c0c0c0cc0c0c0c0c000000000ffff0000000049454e44ae426082',
  'hex'
);

// Create a simple 16x16 PNG (red circle - active state)  
const activePNG = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000001000000010080600000' +
  '01ff3ff610000001c4944415478da' +
  '62fcffc080010101018181818100000000ffff0000000049454e44ae426082',
  'hex'
);

fs.writeFileSync('tray-icon.png', idlePNG);
fs.writeFileSync('tray-icon-active.png', activePNG);
fs.writeFileSync('icon-Template.png', idlePNG);
fs.writeFileSync('icon-Template@2x.png', idlePNG);

console.log('Tray icons created successfully!');
