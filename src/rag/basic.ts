import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";

import { appConfig } from '../config'

async function main() {
    console.log("basic.ts updated");
    const privateData = [
        'My name is Surafel',
        'I have skills in Javascript',
        'I learned langchain',
        'I am experianced in Python',
        'I like oranges',
        'I love pinapple',
        'I worked with C++',
        'Java script is very familiar to me'
    ]

    // create a model
    const model = new ChatOpenAI({
        temperature: 0.9,
        modelName: 'gpt-3.5-turbo',
        apiKey: appConfig.openAIApiKey,
    });

    // create and add your DOCUMENT to the in memory vector store
    const myVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    await myVectorStore.addDocuments(privateData.map(doc => new Document({ pageContent: doc })));
    const context = await myVectorStore.similaritySearch("what is my favorite food", 3);
    console.log("Retrieved context:", context.map((doc) => doc.pageContent));

   // construct a prompt from template
    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: "system",
            content: "you are a helpfull assistant answering a question from {context}"
        },

        {
            role: "user",
            content: "do you think I am a vegiterian?"
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






