require("dotenv").config();
const { Configuration } = require("openai");

export const openai_config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
