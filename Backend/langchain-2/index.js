import { config } from "dotenv";
config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";


//setup the model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature:0.7,
  apiKey: process.env.GEMINI_API_KEY,
});

//create a prompt
const prompt = PromptTemplate.fromTemplate(
    "explain the concept of {topic} to a beginner."
);

//build a chain
const chain = RunnableSequence.from([
    prompt,
    model
])
    


const res  = await chain.invoke({ topic: "express" })
console.log(res.content);