const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const generateResponse = async(content)=>{
    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content
  });
  return response.text;
}

module.exports = {
    generateResponse
}

