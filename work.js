const api_token = "";

// -------------------

const TelegramBot = require("node-telegram-bot-api");
const { Pypi, PackageRelease, require_axios } = require("./pypi/index");
const fs = require("fs");
const bot = new TelegramBot(api_token, { polling: true });
const pypi = new Pypi();

bot.on('message', (message) => {
    if (message.text == "/start"){
        bot.sendMessage(message.chat.id, "welcome to pym bot - send /help to see documentation", {reply_to_message_id: message.message_id});
    } else if ( message.text == "/help" ){
        bot.sendMessage(
            message.chat.id,
            "/search <MODULE NAME>\n/download <MODULE NAME>",
            {reply_to_message_id: message.message_id}
        )
    } else if ( message.text.startsWith("/search") ){
        const module_name = message.text.substring(7).trim();
        pypi.on({
            module_name: module_name,
            callback: (module_logs) => {
                let mld_logs = new PackageRelease(module_logs);
                bot.sendPhoto(message.chat.id, "./github-icon.jpg", { caption: `📁 Package Name: ${mld_logs.package_name}\n🌐 Package Version: ${mld_logs.package_version}\n📃 Search Description: ${mld_logs.search_description}`, reply_to_message_id: message.message_id });
            }
        })
    } else if ( message.text.startsWith("/download") ){
        const module_name = message.text.substring(9).trim();
        pypi.on({
            module_name: module_name,
            callback: (module_logs) => {
                let mld_logs = new PackageRelease(module_logs);
                let splitted = mld_logs.download_url.split("/");
                let fname = splitted[splitted.length - 1]
                const writer = fs.createWriteStream(fname);
                require_axios(
                    {
                        method: "get",
                        url: mld_logs.download_url,
                        responseType: "stream"
                    }
                ).then(response => {
                    response.data.pipe(writer);
                    writer.on('finish', () => {
                        bot.sendDocument(message.chat.id, fname, { caption: `📁 Package Name: ${mld_logs.package_name}\n🌐 Package Version: ${mld_logs.package_version}\n📃 Search Description: ${mld_logs.search_description}`, reply_to_message_id: message.message_id });
                        fs.unlinkSync(fname);
                    })
                    writer.on('error', (err) => {
                        bot.sendMessage(message.chat.id, `♦ Error: ${err}`, {reply_to_message_id: message.message_id});
                        if (fs.existsSync(fname)){
                            fs.unlinkSync(fname);
                        }
                    })
                }).catch(error => {
                    bot.sendMessage(message.chat.id, `♦ Error: ${error}`, {reply_to_message_id: message.message_id});
                    if (fs.existsSync(fname)){
                        fs.unlinkSync(fname);
                    }
                })
            }
        })
    }
})
