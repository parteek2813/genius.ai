import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});
// console.log(configuration);

export async function POST(req: Request) {
  try {
    // First check if authenticated or not
    const { userId } = auth();

    const body = await req.json();

    const { prompt } = body;

    // if there is no userId, just return from here
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    // console.log("Reached response");
    //  interact with openai for responses

    const response = await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
        },
      }
    );

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse("Internal Server Error [route.ts:44]", {
      status: 500,
    });
  }
}
