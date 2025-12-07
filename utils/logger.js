const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class Logger {
    static success(message) {
        console.log(`${colors.green}✅ ${message}${colors.reset}`);
    }

    static error(message) {
        console.log(`${colors.red}❌ ${message}${colors.reset}`);
    }

    static warning(message) {
        console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
    }

    static info(message) {
        console.log(`${colors.cyan}ℹ️ ${message}${colors.reset}`);
    }

    static bot(message) {
        console.log(`${colors.magenta}🤖 ${message}${colors.reset}`);
    }

    static system(message) {
        console.log(`${colors.blue}⚙️ ${message}${colors.reset}`);
    }
}

module.exports = Logger;
