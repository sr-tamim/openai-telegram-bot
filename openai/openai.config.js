require("dotenv").config();
const { Configuration } = require("openai");

module.exports = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
