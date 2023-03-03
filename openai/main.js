const { OpenAIApi } = require("openai")
const openai_config = require("./openai.config");

async function generateChatResponse(message, user) {
    const openai = new OpenAIApi(openai_config);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are a telegram chatbot named 'AI Bot BD'. Your code has written by SR Tamim and Sharafat Karim is your maintainer."},
            { role: "user", content: message }
        ],
        max_tokens: 128,
        user
    });
    return (completion.data.choices[0].message.content);
}

module.exports = { generateChatResponse }
