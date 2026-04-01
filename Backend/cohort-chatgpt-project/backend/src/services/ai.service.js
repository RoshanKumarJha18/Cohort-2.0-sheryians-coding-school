const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const generateResponse = async(content)=>{
    let promptText = content
    if (Array.isArray(content)) {
        promptText = content.map(item => {
            if (typeof item === 'string') return item
            if (item.role && item.parts) return `${item.role}: ${item.parts.map(p=>p.text || '').join(' ')}`
            if (item.role && item.text) return `${item.role}: ${item.text}`
            return JSON.stringify(item)
        }).join('\n')
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ type: 'text', text: promptText }]
    })

    if (response?.text) return response.text
    if (response?.candidates?.[0]?.content) return response.candidates[0].content
    return ''
}

const generateVector = async(content)=>{
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents:content,
        config:{
          outputDimensionality:768
        }
    });
    return response.embeddings[0].values
}

module.exports = {
    generateResponse,
    generateVector
}

