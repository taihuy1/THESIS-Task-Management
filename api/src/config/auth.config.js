require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 12;

if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_secret_key')) {
    console.error('set JWT_SECRET before running in prod');
    process.exit(1);
}

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS };
