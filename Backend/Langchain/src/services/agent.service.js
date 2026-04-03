const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const { PromptTemplate } = require("@langchain/core/prompts")

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY
})

PromptTemplate = new PromptTemplate(
    `You are a helpful assistant. Answer the following question: {question}`
)

const chain = PromptTemplate.pipe(model);

const langAgent = async (message)=>{
    console.log(message)
}

module.exports = langAgent;
