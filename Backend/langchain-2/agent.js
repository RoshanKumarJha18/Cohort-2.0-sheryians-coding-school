import { config } from "dotenv";
config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { SerpAPI } from "@langchain/community/tools/serpapi";

// Setup the model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GEMINI_API_KEY,
});

// SerpAPI tool
const serpApiTool = new SerpAPI(process.env.SERP_API_KEY, {
  location: "India",  // Capitalized
});

// Create agent with correct syntax
const agent = createAgent({
  model,
  tools: [serpApiTool],
  systemPrompt: "You are an AI news bot. Use search for latest/current news.",  // Optional but recommended
});

// Try a question
const res = await agent.invoke({
  messages: [{ role: "user", content: "latest news of Hyderabad?" }],
});

console.log(res.messages[res.messages.length - 1].content);