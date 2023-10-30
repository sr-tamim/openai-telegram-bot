const { Telegraf } = require("telegraf")
require("dotenv").config()
const { generateChatResponse } = require("../../openai/main")
const bot = new Telegraf(process.env.BOT_TOKEN)

const allowedGroups = process.env.GROUP_ID.toString().split(',')

bot.start(async ctx => {
    const greetings = `*Hello, ${ctx.message?.from?.first_name ?
        `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name||""}`
        : ctx.message?.from?.username || "Homo Sapiens!"}* \n`;

    return ctx.reply(greetings + "Our free access of OpenAI API has been expired\\. So, we are not able to provide you the service anymore\\. \n\nIf you want to use this bot, please contact with my maintainers\\. \nDeveloper \\> @sr\\_tamim \nMaintainer \\> @SharafatKarim \n\nThank you for using this bot\\. \n\n[View My Source Code](https://github.com/sr-tamim.openai-telegram-bot)", {
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true
    });
    try {
        if (!allowedGroups.includes(ctx.message?.chat?.id.toString())) {
            return ctx.reply("I am not allowed to reply outside specific groups. Contact with my maintainers if you want to test my capabilities. \nDeveloper > @sr_tamim \nMaintainer > @SharafatKarim");
        };
        return ctx.reply("Hi, this is *AI Bot BD*, ready to chat with you. \nReply to my message to start chatting...", {
            parse_mode: "Markdown",
            reply_markup: { force_reply: true }
        })
    } catch (e) {
        console.error("error in start action:", e)
        return ctx.reply("Error occured")
    }
})

bot.on("message", async (ctx) => {
    if (ctx.message.via_bot) {
        return ctx.reply("Sorry! I don't reply bots.");
    }
    const greetings = `*Hello, ${ctx.message?.from?.first_name ?
        `${ctx.message?.from?.first_name} ${ctx.message?.from?.last_name||""}`
        : ctx.message?.from?.username || "Homo Sapiens!"}* \n`;

    return ctx.reply(greetings + "Our free access of OpenAI API has been expired\\. So, we are not able to provide you the service anymore\\. \n\nIf you want to use this bot, please contact with my maintainers\\. \nDeveloper \\> @sr\\_tamim \nMaintainer \\> @SharafatKarim \n\nThank you for using this bot\\. \n\n[View My Source Code](https://github.com/sr-tamim.openai-telegram-bot)", {
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true
    });
    try {
        if (!allowedGroups.includes(ctx.message?.chat?.id.toString())) {
            return ctx.reply("I am not allowed to reply outside specific groups. Contact with my maintainers if you want to test my capabilities. \nDeveloper > @sr_tamim \nMaintainer > @SharafatKarim");
        };

        // message must be a reply of this bot's message
        if (ctx.message?.reply_to_message?.from?.id?.toString() !== process.env.BOT_ID.toString()) return

        ctx.telegram.sendChatAction(ctx.message.chat.id, "typing")

        const response = await generateChatResponse(ctx.message.text, ctx.message?.reply_to_message?.text,
            ctx.message?.from?.username || ctx.message?.from?.id?.toString());
        return ctx.reply(response, {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            reply_markup: { force_reply: true, selective: true }
        });
    } catch (error) {
        console.log(error)
        return ctx.reply("Error occured!\n" + JSON.stringify(error));
    }
})

exports.bot = bot;

// AWS event handler syntax (https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body))
        return { statusCode: 200, body: "" }
    } catch (e) {
        console.error("error in handler:", e)
        return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" }
    }
}