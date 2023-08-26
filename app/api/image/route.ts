import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

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

    const { prompt, amount = 1, resolution = "512x512" } = body;

    console.log(body);
    // if there is no userId, just return from here
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("resolution is required", { status: 400 });
    }

    console.log("Reached response");
    //  interact with openai for responses

    const response = await openai.createImage({
      prompt,
      n: parseInt(amount),
      size: resolution,
    });

    // const image_url = response.data.data[0].url;
    // console.log(image_url);

    return NextResponse.json(response.data.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Server Error [route.ts:44]", {
      status: 500,
    });
  }
}
