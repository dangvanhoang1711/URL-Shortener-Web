const QRCode = require('qrcode');

/**
 * Generate QR code from a URL
 * @param {string} url - The URL to encode
 * @param {Object} options - Options for QR code generation
 * @param {string} [options.format='image/png'] - Output format ('image/png' or 'image/svg+xml')
 * @param {number} [options.size=300] - Width/height in pixels
 * @param {string} [options.errorCorrectionLevel='H'] - Error correction level ('L', 'M', 'Q', 'H')
 * @param {Object} [options.color] - Colors { dark: '#000', light: '#FFF' }
 * @returns {Promise<string>} - Base64 data URL (for PNG) or SVG string
 */
async function generateQR(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: options.format || 'image/png',
    width: options.size || 300,
    margin: 1,
    color: {
      dark: '#000',
      light: '#FFF'
    }
  };

  if (options.format === 'image/svg+xml' || options.format === 'svg') {
    return QRCode.toString(url, { ...defaultOptions, type: 'svg' });
  } else {
    // Default to PNG
    return QRCode.toDataURL(url, { ...defaultOptions, type: 'image/png' });
  }
}

/**
 * Save QR code to a file (optional)
 * @param {string} url - The URL to encode
 * @param {string} filepath - Path to save the file
 * @param {Object} options - Options for QR code generation
 * @returns {Promise<void>}
 */
async function saveQRToFile(url, filepath, options = {}) {
  const opts = {
    errorCorrectionLevel: 'H',
    width: options.size || 300,
    margin: 1,
    color: {
      dark: '#000',
      light: '#FFF'
    }
  };
  return QRCode.toFile(filepath, url, opts);
}

module.exports = {
  generateQR,
  saveQRToFile
};