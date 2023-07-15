const { OpenAIApi } = require("openai")
const openai_config = require("./openai.config");

async function generateChatResponse(message, reply_to_message, user, name) {
    const openai = new OpenAIApi(openai_config);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a telegram chatbot named 'AI Bot BD'. Your code has written by @sr_tamim and @SharafatKarim is your maintainer." },
            { role: "assistant", content: reply_to_message || "How can I help you?" },
            { role: "user", content: name ? `I'm ${name}. ${message}` : message }
        ],
        max_tokens: 512,
        user
    });
    return (completion.data.choices[0].message.content);
}

async function generateImageResponse(prompt, user) {
    const openai = new OpenAIApi(openai_config);
    const response = await openai.createImage({
        prompt, n: 1, size: "256x256", user
    })
    return response.data.data[0].url
}

module.exports = { generateChatResponse, generateImageResponse }
