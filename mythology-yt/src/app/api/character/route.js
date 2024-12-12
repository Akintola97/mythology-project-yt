import { NextResponse } from "next/server";
import prisma from "../../../../lib/db";
import axios from "axios";

const API_KEY = process.env.OPENAI_KEY;

const isImageUrlValid = async (url) => {
  try {
    await axios.head(url);
    return true;
  } catch (error) {
    return false;
  }
};

export async function POST(request) {
  try {
    const { search } = await request.json();

    if (!search || typeof search !== "string") {
      return NextResponse.json(
        { error: "Invalid Search Term" },
        { status: 400 }
      );
    }

    const character = await prisma.character.findUnique({
      where: { name: search.toLowerCase() },
    });

    if (character) {
      const isValidUrl = await isImageUrlValid(character.imageUrl);

      if (isValidUrl) {
        return NextResponse.json(character, { status: 200 });
      }
      console.log("Image Url expired, regenerating...");
      const imagePrompt = `${search}, a mythological character, rendered in a grand, realistic, aesthetic fashion.`;

      const dalleResponse = await axios.post(
        `https://api.openai.com/v1/images/generations`,
        {
          prompt: imagePrompt,
          n: 1,
          size: "1024 x 1024",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const newImageUrl = dalleResponse.data.data[0]?.url;

      if (!newImageUrl) {
        return NextResponse.json(
          { error: "Failed to generate a valid image for the character." },
          { status: 400 }
        );
      }
      const updatedCharacter = await prisma.character.update({
        where: { name: search.toLowerCase() },
        data: { imageUrl: newImageUrl },
      });
      return NextResponse.json(updatedCharacter, { status: 200 });
    }

    if (!API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    let aiResponse;
    let attempts = 0;
    const maxAttempts = 4;

    while (attempts < maxAttempts) {
      try {
        const messages = [
          {
            role: "system",
            content:
              "You are a helpful assistant providing detailed information about mythological characters, creatures and lores. Including their origin, stories, cultural significance, and symbolic imagery. Always respond in JSON format with the keys: `name`, `description`.",
          },
          {
            role: "user",
            content: `Provide detailed information about the mythological character named "${search}". The JSON object should include:
                        - name: The character's name.
                        - description: A detailed description of the characters origin, major stories, and symbolic significance.
                        `,
          },
        ];

        const response = await axios.post(
          `https://api.openai.com/v1/chat/completions`,
          {
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        aiResponse = response.data.choices[0].message.content.trim();
        aiResponse = aiResponse.replace(/```json|```/g, "").trim();

        const characterData = JSON.parse(aiResponse);

        if (
          characterData.name &&
          characterData.description &&
          !characterData.description.toLowerCase().includes("fictional") &&
          !characterData.description.toLowerCase().includes("movie")
        ) {
          break;
        }
      } catch (error) {
        console.error(
          `Attempt ${attempts + 1}: Failed to fetch/parse AI response.`,
          error
        );
      }
      attempts++;
    }
    if (!aiResponse || attempts === maxAttempts) {
      return NextResponse.json(
        {
          error: "Failed to get valid AI response after multiple attempts",
        },
        { status: 500 }
      );
    }
    const characterData = JSON.parse(aiResponse);

    const imagePrompt = `${search}, a mythological character, rendered in a grand, realistic, aesthetic fashion.`;

    const dalleResponse = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = dalleResponse.data.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate a valid image for the character." },
        { status: 400 }
      );
    }

    const savedCharacter = await prisma.character.create({
      data: {
        name: characterData.name.toLowerCase(),
        description: characterData.description,
        imageUrl: imageUrl,
      },
    });
    console.log(savedCharacter);
    return NextResponse.json(savedCharacter, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch or generate character details" },
      {
        status: 500,
      }
    );
  }
}
