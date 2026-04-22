import dotenv from "dotenv";
dotenv.config();
import * as z from "zod";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  tool,
  createAgent,
} from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import { webSearch } from "./internet.service.js";
import { response } from "express";

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

const webSearchTool = tool(webSearch, {
  name: "webSearch",
  description: "Search the web for information",
  schema: z.object({
    query: z.string().describe("The query to search the web for"),
  }),

});

const tools = [webSearchTool];

const agent = createAgent({
  model: mistralModel,
  tools,
});

export async function generateResponse(message, onChunk) {
  // 1. Call agent.stream() instead of agent.invoke()
  let response = await agent.stream({ 
    messages: [
      new SystemMessage(`
            You are a helpful assistant that provides concise and relevant responses to user queries. 
            Your goal is to understand the user's question and provide accurate and informative answers in a clear and concise manner.
            
            IMPORTANT: When the user asks for information about recent events, current news, or any topic that requires up-to-date information, YOU MUST use the available web search tool. 
            Do not rely on your internal knowledge base for such queries. 
            Use the web search tool to find the most relevant and recent information and then provide a comprehensive answer to the user.
        `),
      ...(Array.isArray(message)
        ? message.filter((msg) => msg.content && msg.content.trim() !== "").map((msg) => {
            if (msg.sender === "user") {
              return new HumanMessage(msg.content);
            } else {
              return new AIMessage(msg.content);
            }
          })
        : [new HumanMessage(message)]),
    ]
  },{ streamMode: "messages" });

//   for await (const chunk of stream) {
//   // Now you are logging the actual data chunks arriving from LangChain/Mistral
//   console.log("Chunk arrived:", chunk.model_request.messages[0].content); 
// }x

  let fullContent = "";

  // 2. Iterate over the stream as chunks arrive
  for await (let chunk of response) {
    // Depending on whether "agent" is a raw model, a chain, or an AgentExecutor, 
    // the text payload might be under .content (for models) or .output (for agents).
    console.log("Chunk:", chunk[0].content);
    let content = chunk[0].content;

    if (content) {
      if(typeof content === "object"){
        continue;
      }
      fullContent += content;

      // 3. Call the callback to send this chunk to the socket
      if (onChunk) onChunk(content);
    }
  }

  console.log("Generated full response:", fullContent);
  response.content=fullContent;
  return response.content;
}

export async function generateEmbeddings(message) {
  let textToEmbed;
  if (Array.isArray(message)) {
    textToEmbed = message.map((msg) => msg.content).join("\n");
  } else if (typeof message === "object" && message !== null) {
    textToEmbed = message.content;
  } else {
    textToEmbed = message;
  }

  const embeddings = await google_embeddings.embedQuery(textToEmbed);
  return embeddings;
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.
            Don't give any extra text with title.
            Don't include "" around the title. eg. don't give "my chat" give My Chat
           
        `),
    new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `),
  ]);

  return response.content;
}
