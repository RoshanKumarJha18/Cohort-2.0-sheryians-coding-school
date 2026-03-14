const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});
 
const generateContent = async (chatHistory)=>{
    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:chatHistory,
  });
  return response.text;
}
module.exports = generateContent;

