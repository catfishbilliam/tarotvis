import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Replace with your key if not in .env
});

async function main() {
  // Create vector store
  const vectorStore = await openai.beta.vectorStores.create({
    name: "my_tarot_vector_store"
  });
  console.log("Vector Store Created:", vectorStore);

  // Attach file to vector store
  const myVectorStoreFile = await openai.beta.vectorStores.files.create(
    vectorStore.id, // Replace with your vector store ID
    {
      file_id: "file-abc123" // Replace with your file ID
    }
  );
  console.log("File Attached:", myVectorStoreFile);
}

main().catch(console.error);
