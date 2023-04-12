const { Telegraf } = require("telegraf")
require("dotenv").config()
const { generateChatResponse } = require("../../openai/main")
const bot = new Telegraf(process.env.BOT_TOKEN)

const allowedGroups = process.env.GROUP_ID.toString().split(',')

bot.start(async ctx => {
    console.log("Received /start command")
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
    try {
        if (!allowedGroups.includes(ctx.message?.chat?.id.toString())) {
            return ctx.reply("I am not allowed to reply outside specific groups. Contact with my maintainers if you want to test my capabilities. \nDeveloper > @sr_tamim \nMaintainer > @SharafatKarim");
        };

        // message must be a reply of this bot's message
        if (ctx.message?.reply_to_message?.from?.id?.toString() !== process.env.BOT_ID.toString()) return

        ctx.telegram.sendChatAction(ctx.message.chat.id, "typing")
        const botMsg = await ctx.reply("Generating response...", {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            // reply_markup: { force_reply: true, selective: true }
        });

        const response = await generateChatResponse(ctx.message.text, ctx.message?.reply_to_message?.text,
            ctx.message?.from?.username || ctx.message?.from?.id?.toString());

        let responseText = ""
        let streamCount = 0

        response.data.on('data', data => {
            const chunks = data.toString().split("data: ")
            chunks.forEach(async chunk => {
                if (!chunk || chunk === '\n') return
                if (chunk.includes('[DONE]')) {
                    await ctx.telegram.editMessageText(botMsg.chat.id, botMsg.message_id, undefined, responseText, {
                        parse_mode: "Markdown"
                    })
                    return
                }
                const { delta } = JSON.parse(chunk).choices[0]
                if (!delta?.content) return
                responseText += delta.content
                console.log(streamCount);
                streamCount++
                if ((streamCount < 10 && streamCount % 2 === 0)
                    || (streamCount < 20 && streamCount % 5 === 0)
                    || (streamCount < 100 && streamCount % 20 === 0)
                    || (streamCount % 30 === 0)) {
                    await ctx.telegram.editMessageText(botMsg.chat.id, botMsg.message_id, undefined, responseText)
                }
            })
        })
        return
    } catch (error) {
        console.log(error)
        return ctx.reply("Error occured");
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