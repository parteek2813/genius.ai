import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
// console.log(configuration);

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

    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }
    console.log("Reached response");
    //  interact with openai for responses

    console.log(messages);

    const response = await openai.createChatCompletion({
      messages,
      model: "gpt-3.5-turbo",
    });

    if (!isPro) {
      await incrementApiLimit();
    }

    console.log(response.data.choices[0].message);

    return NextResponse.json(response.data.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Server Error [route.ts:44]", {
      status: 500,
    });
  }
}
