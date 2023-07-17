require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;
const { Configuration, OpenAIApi } = require("openai");

console.log(apiKey);
const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

async function chatGpt(Content) {
    
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: Content }],
  });
  
  return chatCompletion.data.choices[0].message;
}

module.exports = chatGpt;
