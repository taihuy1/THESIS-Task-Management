// started with console.log everywhere, switched to winston for prod
// but kept the console wrapper  because it's easier to read
const isProd = process.env.NODE_ENV === 'production';

let logger;

if (isProd) {
    const winston = require('winston');
    logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [new winston.transports.Console()],
    });
} else {
    // dev mode — just console with a tag, good enough
    const tag = (lvl) => `[${lvl}]`;
    logger = {
        info:  (...args) => console.log(tag('info'), ...args),
        warn:  (...args) => console.warn(tag('WARN'), ...args),
        error: (...args) => console.error(tag('ERR'), ...args),
        debug: (...args) => console.debug(tag('dbg'), ...args),
    };
}

module.exports = logger;
