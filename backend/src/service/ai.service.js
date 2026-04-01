import dotenv from "dotenv";
dotenv.config();

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const google_model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const google_embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-2-preview",
});

export async function generateResponse(message) {
  const response = await google_model.invoke([
    new SystemMessage(`
            You are a helpful assistant that provides concise and relevant responses to user queries. 
            Your goal is to understand the user's question and provide accurate and informative answers in a clear and concise manner.
        `),
    ...(Array.isArray(message)
      ? message.map((msg) => {
          if (msg.sender === "user") {
            return new HumanMessage(msg.content);
          } else {
            return new AIMessage(msg.content);
          }
        })
      : [new HumanMessage(message)]),
  ]);
  return response.content;
}

export async function generateEmbeddings(text) {
  const embeddings = await google_embeddings.embedQuery(text);
  console.log("Generated embeddings:", embeddings);
  return embeddings;
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
    new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `),
  ]);

  return response.content;
}
