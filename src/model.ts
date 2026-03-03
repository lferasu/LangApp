import { ChatOpenAI } from '@langchain/openai';
import { appConfig } from './config';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
    temperature: 0.9,
    modelName: 'gpt-3.5-turbo',
    apiKey: appConfig.openAIApiKey,
    // verbose: true,
});

const prompts = [
    'write exactly 100 word essay about why someone should move to',
    'What is the largest mammal?',
    'Who wrote "To Kill a Mockingbird"?',
];

const roleObject = {
    role: "system",
    content: "You are a helpful assistant."
}

async function invoked() {
    const prompt = 'What is the capital of France?';
    const response = await model.invoke(prompt);
    console.log('Response:', response.content);
}

async function batched() {
    const response = await model.batch(prompts);
    console.log('Batched Response:', response.map(chunk => chunk.content));
}



async function streamed() {
    const response = await model.stream(prompts[0]);
    for await (const chunk of response) {
        process.stdout.write(String(chunk.content));
    }
}


function main() {
    // process.stdin.addListener('data', funcRequest);
    // process.stdout.write('I : B: S: or E \n');

    process.stdin.addListener('data', outputParserComa);
    process.stdout.write('what country? \n');

}

const funcRequest = (data: Buffer) => {
    const input = data.toString().trim().toUpperCase();
    switch (input) {
        case 'I':
            invoked();
            break;
        case 'B':
            batched();
            break;
        case 'S':
            streamed();
            break;
        case 'E':
            console.log('Exiting...');
            process.exit(0);

    }
}

const funcTemplateTest = async (input: Buffer) => {

    const template = ChatPromptTemplate.fromTemplate('what is the capital of {country}')

    //const prompt = await template.format({ country: input.toString().trim() });
    // console.log('Formatted Prompt:', prompt);

    // const response = await model.stream(prompt);
    // for await (const chunk of response) {
    //     process.stdout.write(String(chunk.content));
    // }
    const chain = template.pipe(model);   // we created a binding between the prompt and the model
    const response = await chain.stream({
        country: input.toString().trim()
    })

    for await (const chunk of response) {
        process.stdout.write(String(chunk.content));
    }
    console.log('\nwhat country? \n');


}

// const funcTemplateFromMessage = async (input: Buffer) => {
//     const template = ChatPromptTemplate.fromMessages([
//         ['system', 'you are an assistant'],
//         ['user', 'give a table that can be rendered in console about all countries  (make sure that you listed all countries) in {continent} and their population number']
//     ])

//     const parser  = new StringOutputParser()
//     const chain = template.pipe(model).pipe(parser);

//     const response = await chain.stream({
//         continent: input.toString().trim()
//     })

//     for await (const chunk of response) {
//         process.stdout.write(String(chunk))
//     }
// }

const outputParserComa = async (input: Buffer) => {
    const template = ChatPromptTemplate.fromMessages([
        ['system', 'you are an assistant'],
        ['user', 'give the first 10 popular names in the country of {country}']
    ])

    const parser  = new CommaSeparatedListOutputParser()
    const chain = template.pipe(model).pipe(parser);

    const response = await chain.stream({
        country: input.toString().trim()
    })

    for await (const chunk of response) {
        process.stdout.write(String(chunk))
    }
}









    main()



