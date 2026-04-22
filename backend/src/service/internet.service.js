import { tavily as tavilyClient } from "@tavily/core";
import dotenv from "dotenv";
dotenv.config();

const tavily = tavilyClient({ apiKey: process.env.TAVILY_API_KEY });

export async function webSearch({query}) {
  console.log(query)
  const result = await tavily.search(query, {
    max_results: 2,
    search_space: "web",
  });
  return result;
}
