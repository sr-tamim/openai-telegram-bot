const { Telegraf } = require("telegraf")
require("dotenv").config()
const { generateChatResponse, generateImageResponse } = require("../../openai/main")
const bot = new Telegraf(process.env.BOT_TOKEN)
const allowedGroups = process.env.GROUP_ID.toString().split(',')

// message queue to avoid openai api rate limit
const messageQueue = []
let lastReplySent = Date.now()
const delay = 20000 // as per openai docs, i can send 3 requests per minute https://platform.openai.com/docs/guides/rate-limits/what-are-the-rate-limits-for-our-api

// image queue to avoid openai api rate limit
const imageQueue = []
let lastImageSent = Date.now()
const imageDelay = 12000 // as per openai docs, i can send 5 image generation requests per minute https://platform.openai.com/docs/guides/rate-limits/what-are-the-rate-limits-for-our-api


/* ======= helper functions ======= */
const sendResponse = async () => {
    if (messageQueue.length === 0) return console.log("No message in queue")
    const ctx = messageQueue[0]
    const now = Date.now()
    const timeGap = now - lastReplySent
    if (timeGap > delay) {
        const response = await generateChatResponse(ctx.message.text, ctx.message?.reply_to_message?.text,
            ctx.message?.from?.username || ctx.message?.from?.id?.toString());
        messageQueue.shift()
        lastReplySent = Date.now()
        ctx.reply(response, {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            reply_markup: { force_reply: true, selective: true }
        });
    }
    if (messageQueue.length > 0) return setTimeout(() => sendResponse(), delay - timeGap)
}
const sendImageResponse = async () => {
    if (imageQueue.length === 0) return console.log("No image in queue")
    const ctx = imageQueue[0]
    const now = Date.now()
    const timeGap = now - lastImageSent
    if (timeGap > imageDelay) {
        try {
            const prompt = ctx.message.text.includes("/image@OpenAI_BD_bot") ?
                (ctx.message.text.replace("/image@OpenAI_BD_bot", "").trim())
                : (ctx.message.text.replace("/image", "").trim())
            const response = await generateImageResponse(prompt, ctx.message?.from?.username || ctx.message?.from?.id?.toString());
            lastImageSent = Date.now()
            ctx.replyWithPhoto(response, {
                reply_to_message_id: ctx.message?.message_id,
                allow_sending_without_reply: true
            });
        } catch (e) {
            console.log(e)
            ctx.reply("Error occured!")
        } finally {
            imageQueue.shift()
        }
    }
    if (imageQueue.length > 0) return setTimeout(() => sendImageResponse(), imageDelay - timeGap)
}


/* ======= bot actions ======= */
bot.start(async ctx => {
    console.log("Received /start command")
    try {
        if (!allowedGroups.includes(ctx.message?.chat?.id.toString())) {
            return ctx.reply("I am not allowed to reply outside specific groups. Contact with my maintainers if you want to test my capabilities. \nDeveloper > @sr_tamim \nMaintainer > @SharafatKarim");
        };
        return ctx.reply("Hi, this is *AI Bot BD*, ready to chat with you. \nReply to my message to start chatting...", {
            parse_mode: "Markdown",
            allow_sending_without_reply: true,
            reply_to_message_id: ctx.message?.message_id,
            reply_markup: { force_reply: true, selective: true }
        })
    } catch (e) {
        console.error("error in start action:", e)
        return ctx.reply("Error occured")
    }
})

bot.command("image", async ctx => {
    if (ctx.message.from.is_bot) {
        return ctx.reply("Sorry! I don't reply bots.");
    }
    try {
        if (!allowedGroups.includes(ctx.message?.chat?.id.toString())) {
            return ctx.reply("I am not allowed to reply outside specific groups. Contact with my maintainers if you want to test my capabilities. \nDeveloper > @sr_tamim \nMaintainer > @SharafatKarim");
        };
        const hasPrompt = ctx.message.text.includes("/image@OpenAI_BD_bot") ?
            (!!ctx.message.text.replace("/image@OpenAI_BD_bot", "").trim())
            : (!!ctx.message.text.replace("/image", "").trim())
        if (!hasPrompt) return ctx.reply("Please provide a prompt with /image command to generate image. \nExample: `/image a cute white cat`", {
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            reply_markup: { force_reply: true, selective: true }
        })

        ctx.telegram.sendChatAction(ctx.message.chat.id, "upload_photo")
        imageQueue.push(ctx)
        return imageQueue.length === 1 ? sendImageResponse() : null
    } catch (error) {
        console.log(error)
        return ctx.reply("Error occured");
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
        messageQueue.push(ctx)
        return messageQueue.length === 1 ? sendResponse() : null
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