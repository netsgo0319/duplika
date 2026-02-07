import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

export async function chunkText(text: string): Promise<string[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }
  return splitter.splitText(text);
}
