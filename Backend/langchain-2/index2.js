//Latest Method LCEL Method

import { config } from "dotenv";
config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


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

//create an output parser
const outputParser = new StringOutputParser();

//build a chain
const chain = prompt.pipe(model).pipe(outputParser);
    


const res  = await chain.invoke({ topic: "express" })
console.log(res);