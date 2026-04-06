const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate a random alphanumeric code of length N
const generateRandomCode = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
};

// Generate QR Code as Data URI
const generateQRCodeURI = async (payload) => {
  try {
    const stringData = JSON.stringify(payload);
    // Returns a Data URI (data:image/png;base64,...)
    return await QRCode.toDataURL(stringData);
  } catch (err) {
    console.error('Error generating QR:', err);
    throw err;
  }
};

module.exports = { generateRandomCode, generateQRCodeURI };
