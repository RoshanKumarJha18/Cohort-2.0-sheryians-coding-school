# LangChain Concept Explainer

A simple LangChain application that uses Google Generative AI to explain programming concepts to beginners.

## What This Does

This project demonstrates a basic LangChain chain that:
- Takes a programming topic as input
- Uses a prompt template to format the request
- Calls Google Generative AI (Gemini) to generate an explanation
- Outputs a beginner-friendly explanation

## Current Example

The current code explains the concept of "Express" (a Node.js web framework) to beginners.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Google AI API key:
```
GEMINI_API_KEY=your_api_key_here
```

3. Run the application:
```bash
npm run dev
```

## Code Overview

- **Model Setup**: Uses `ChatGoogleGenerativeAI` with Gemini 2.5 Flash
- **Prompt Template**: Creates a template for explaining concepts to beginners
- **Runnable Chain**: Combines the prompt and model into a sequence
- **Execution**: Invokes the chain with a topic and logs the response

## Dependencies

- `@langchain/core`: Core LangChain functionality
- `@langchain/google-genai`: Google Generative AI integration
- `dotenv`: Environment variable management

npm i @langchain/community --legacy-peer-deps 