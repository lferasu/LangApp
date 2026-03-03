import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


import { appConfig } from '../config'

async function main() {
    
    const loader = new CheerioWebBaseLoader("https://en.wikipedia.org/wiki/Fast_of_Esther");
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const splittedDocs = await splitter.splitDocuments(docs);

    // create a model
    const model = new ChatOpenAI({
        temperature: 0.9,
        modelName: 'gpt-3.5-turbo',
        apiKey: appConfig.openAIApiKey,
    });

    // create and add your DOCUMENT to the in memory vector store
    const myVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    await myVectorStore.addDocuments(splittedDocs);
    const context = await myVectorStore.similaritySearch("what is available about ethiopia", 3);
    console.log("Retrieved context:", context.map((doc) => doc.pageContent));

   // construct a prompt from template
    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: "system",
            content: "you are a helpfull assistant answering a question from {context}"
        },

        {
            role: "user",
            content: "is ethiopia mentioned	?"
        }
    ])

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({
        context: context.map((doc) => doc.pageContent).join(", ") || "No context available",
    });
    console.log('Response:', response);
}

main();

//






