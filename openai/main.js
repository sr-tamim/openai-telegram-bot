const { OpenAIApi } = require("openai")
const openai_config = require("./openai.config");

async function generateChatResponse(message) {
    const openai = new OpenAIApi(openai_config);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 128
    });
    return (completion.data.choices[0].message.content);
}

module.exports = { generateChatResponse }
