
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getInteriorAdvice = async (imageBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "이 거실 사진을 분석해서 벽에 어떤 크기와 색상의 액자가 어울릴지 추천해줘. JSON 형식으로 답해줘: { recommendation: string, colors: string[] }" }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return null;
  }
};
