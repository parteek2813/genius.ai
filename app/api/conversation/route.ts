import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    // First check if authenticated or not
    const { userId } = auth();

    const body = await req.json();

    const { messages } = body;

    // if there is no userId, just return from here
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
