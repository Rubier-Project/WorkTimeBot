const api_token = "";

// -------------------

const TelegramBot = require("node-telegram-bot-api");
const { Pypi, PackageRelease } = require("./pypi/index");
const bot = new TelegramBot(api_token, { polling: true });
const pypi = new Pypi();

bot.on('message', (message) => {
    if (message.text == "/start"){
        bot.sendMessage(message.chat.id, "welcome to pym bot - send /help to see documentation");
    } else if ( message.text == "/help" ){
        bot.sendMessage(
            message.chat.id,
            "/search <MODULE NAME>\n/download <MODULE NAME>"
        )
    } else if ( message.text.startsWith("/search") ){
        const module_name = message.text.substring(7).trim();
        pypi.on({
            module_name: module_name,
            callback: (module_logs) => {
                let mld_logs = new PackageRelease(module_logs);
                bot.sendPhoto(message.chat.id, "./github-icon.jpg", { caption: `📁 Package Name: ${mld_logs.package_name}\n🌐 Package Version: ${mld_logs.package_version}\n📃 Search Description: ${mld_logs.search_description}` });
            }
        })
    } else if ( message.text.startsWith("/download") ){
        const module_name = message.text.substring(9).trim();
        pypi.on({
            module_name: module_name,
            callback: (module_logs) => {
                let mld_logs = new PackageRelease(module_logs);
                bot.sendDocument(message.chat.id, mld_logs.download_url, { caption: `📁 Package Name: ${mld_logs.package_name}\n🌐 Package Version: ${mld_logs.package_version}\n📃 Search Description: ${mld_logs.search_description}` });
            }
        })
    }
})