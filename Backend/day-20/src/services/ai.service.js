const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});
 
const generateContent = async (data)=>{
    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:data,
  });
  return response.text;
}
module.exports = generateContent;

