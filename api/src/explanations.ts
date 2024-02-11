import OpenAI from 'openai';
import { IEV } from './db';

const openai = new OpenAI({
    apiKey: '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'
});

const prompt = '';
const formatPrompt = (playerAction: IEV) : string => {
    return '';
}

export async function generateExplanation(playerAction: IEV, correctAction: IEV) : Promise<string> {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { 
                role: "user", 
                content: formatPrompt(playerAction)
            }],
        stream: true,
    });
    let response = "";
    for await (const chunk of stream) {
        response += (chunk.choices[0]?.delta?.content || "");
    }
    return response;
}