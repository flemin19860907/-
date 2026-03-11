import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContent(topic: string) {
  const prompt = `
  你是一个资深的新媒体运营专家。请根据主题：“${topic}”，生成以下三个平台的文案。
  重要要求：请必须使用 Markdown 语法进行排版，确保有清晰的层级结构（主标题、副标题、分段等）。

  1. 微信公众号：
     - 必须包含【主标题】（使用 # 标题）和【导语/副标题】（使用 ## 标题或加粗引用）。
     - 正文必须分成多个清晰的段落，并使用【小标题】（使用 ### 标题）进行结构划分。
     - 适合深度阅读，字数800字左右，排版精美专业。
  2. 小红书：
     - 必须包含【主标题】（使用 # 标题，且带有吸引人的Emoji）。
     - 正文必须分段，排版要有呼吸感，活泼有网感，多用Emoji。
     - 建议使用列表（- 或 1.）来清晰罗列要点。
     - 结尾必须包含相关标签（Hashtags），字数300字左右。
  3. 微博：
     - 简明扼要，适合快速阅读。
     - 包含相关话题（#话题#），字数140字左右。
  
  请以JSON格式返回，包含 wechat, xiaohongshu, weibo 三个字段。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          wechat: { type: Type.STRING },
          xiaohongshu: { type: Type.STRING },
          weibo: { type: Type.STRING },
        },
        required: ["wechat", "xiaohongshu", "weibo"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function getHotNews() {
  const prompt = "请列出今天中国最热门的6条新闻或流行话题。只返回一个JSON数组，每个元素包含 title 和 summary 两个字段。";
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["title", "summary"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
}
