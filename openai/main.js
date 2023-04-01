const { OpenAIApi } = require("openai")
const openai_config = require("./openai.config");

async function generateChatResponse(message, reply_to_message, user) {
    const openai = new OpenAIApi(openai_config);
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a telegram chatbot named 'AI Bot BD'. Your code has written by SR Tamim. Sharafat Karim is your maintainer." },
                { role: "assistant", content: reply_to_message || "How can I help you?" },
                { role: "user", content: message }
            ],
            max_tokens: 512,
            user
        });
        return (completion.data.choices[0].message.content);
    } catch (error) {
        console.log(error)
        return error.description || "Error occured!"
    }
}

module.exports = { generateChatResponse }
