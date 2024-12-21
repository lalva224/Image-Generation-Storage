import { NextResponse } from "next/server";
import Groq from 'groq-sdk'
import OpenAI from "openai";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const expandPrompt = async(prompt: string)=>{
  const completion = await client.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
        { role: "system", content: "Expand upon this prompt using imagery for my image generation model. 2 sentences or less." },
        {
            role: "user",
            content:prompt,
        },
    ],
});

  return String(completion.choices[0].message.content)
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    //need to use 20%delimiter in between words.
    const ExpandedPrompt = await expandPrompt(text)
    const ExpandedPromptArray = ExpandedPrompt.split(' ');
    const ExpandedPromptDelimiter = ExpandedPromptArray.join('25');
    console.log(text)
    console.log(ExpandedPrompt)
    const response = await fetch(`https://lalva224--sd-igclone-model-web.modal.run?prompt=${ExpandedPromptDelimiter}`);
    const url = await response.text()
    return NextResponse.json({
      success: true,
      message: url,
    });
  } catch (error:any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
