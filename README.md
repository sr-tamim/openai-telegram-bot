<h1 align="center">OpenAI Telegram Bot</h1>
<h6 align="center">Feel the era of artificial intelligence</h6>

<h5 align="center">This repository contains the code of a Telegram chatbot built using Nodejs and hosted as Netlify serverless function. This chatbot uses OpenAI api to send reply to users on Telegram.</h5>

------

### Description
This code is a Telegram chatbot built using the Telegraf library in Node.js. This chatbot uses the OpenAI API to generate responses to messages sent to it by users. It uses the Telegraf library for Telegram API, and OpenAI's GPT-3.5 API for generating chat responses. The bot's functionality is based on the generateChatResponse function, which takes user input as an argument and generates a response using the OpenAI API. The bot also has a /start command which greets the user and prompts them to start chatting.


The code has been written by [SR Tamim](https://sr-tamim.vercel.app) and maintained by [Sharafat Karim](https://github.com/SharafatKarim). It utilizes the GPT-3.5 model from OpenAI for generating responses, which is known for its impressive natural language processing capabilities. The code is designed to work with as an Netlify Lambda function and can be deployed as a serverless application, which allows it to be deployed to the cloud and easily scaled to handle a large number of requests.

### What is a Telegram Bot?
Telegram is a popular instant messaging app that allows users to send messages, photos, videos, and files. Telegram also has a bot API that enables developers to create chatbots for various use cases, including customer service, news, weather, and more. Telegram bots can be integrated into groups and channels, allowing users to interact with them directly. Bots can respond to user messages, send notifications, and perform other automated tasks.

---

This chatbot can only reply to messages in specific groups, as defined in the "allowedGroups" variable and it only responds to user messages that are replies to its own messages. I have restricted this bot in some groups and did not allow it to response to public messages because it uses **OpenAI api** for generating responses which is not **free**.

##### Anyone who wants to test this bot in telegram, [contact with me](https://sr-tamim.vercel.app/contact) and I will try to add you in the telegram group.


###### This readme has been written by SR Tamim with the help of ChatGPT
