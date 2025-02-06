import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fetchProfileAndPinnedTweets } from "./agent-twitter-client.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const characterDir = path.join(process.cwd(), "character");
if (!fs.existsSync(characterDir)) {
  fs.mkdirSync(characterDir, { recursive: true });
  console.log(`Created directory: ${characterDir}`);
}

app.post("/create-character", async (req, res) => {
  try {
    // Extract the Twitter username from the request body
    const { twitterUsername, ...otherDetails } = req.body;

    // Fetch profile and pinned tweets
    const { profile, pinnedTweetDetails } = await fetchProfileAndPinnedTweets(
      twitterUsername
    );

    // Build a knowledge base that includes the Twitter profile data and pinned tweet details
    const knowledgeBase = {
      ...otherDetails,
      name: profile.name,
      bio: profile.biography,
      pinnedTweetDetails,
    };

    const sampleCharacterJson = `
{
  "name": "John Doe",
  "clients": [],
  "modelProvider": "openai",
  "settings": {
    "secrets": {},
    "voice": { "model": "en_US-male-medium" }
  },
  "plugins": [],
  "bio": [
    "John Doe is a seasoned professional in the AI industry, known for his innovative approaches to problem-solving."
  ],
  "lore": [
    "John has been involved in cutting-edge AI research since the early 2010s, contributing to several landmark projects."
  ],
  "knowledge": [
    "Artificial Intelligence",
    "Machine Learning",
    "Natural Language Processing"
  ],
  "health": {
    "currentStatus": "Good",
    "fitnessLevel": "Intermediate",
    "healthGoals": ["Maintain stamina", "Increase flexibility"],
    "currentRoutine": "Yoga and cycling three times a week"
  },
  "events": [
    {
      "eventName": "AI Conference 2023",
      "location": "San Francisco, USA",
      "date": "2023-10-15",
      "description": "A conference showcasing the latest developments in AI technology."
    }
  ],
  "messageExamples": [
    [
      { "user": "Alice", "content": { "text": "What is machine learning?" } },
      { "user": "John Doe", "content": { "text": "Machine learning involves training algorithms on data to make predictions or decisions without explicit programming." } }
    ]
  ],
  "postExamples": [
    "Excited to attend the upcoming AI Conference in San Francisco. Looking forward to meeting fellow innovators!"
  ],
  "topics": [
    "Artificial Intelligence",
    "Machine Learning",
    "Tech Conferences"
  ],
  "style": {
    "all": ["Professional", "Informative", "Engaging"],
    "chat": ["Clear and concise responses", "Engaging tone"],
    "post": ["Insightful comments", "Actionable advice"]
  },
  "adjectives": ["Experienced", "Innovative", "Analytical"]
}
    `;

    const prompt = `
You are to generate a JSON character profile for a personalized AI assistant.
The JSON should follow the structure below (example):

${sampleCharacterJson}

Use the following knowledge base to generate a unique, diversified JSON character profile that includes detailed events and health factors:

${JSON.stringify(knowledgeBase, null, 2)}

Generate only the JSON output and nothing else.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative assistant that generates unique and diversified character profiles based on provided input data.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const output = response.choices[0].message.content.trim();

    let characterJson;
    try {
      characterJson = JSON.parse(output);
    } catch (parseError) {
      console.error("Failed to parse generated JSON:", parseError);
      return res.status(500).json({
        error: "Generated output is not valid JSON",
        rawOutput: output,
      });
    }

    let filename = "character-" + Date.now() + ".json";
    if (characterJson.name) {
      filename =
        characterJson.name.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Date.now() +
        ".json";
    }
    const filePath = path.join(characterDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(characterJson, null, 2), "utf8");
    console.log(`Saved character file: ${filePath}`);

    res.json({ character: characterJson, filePath });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Failed to generate character JSON" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
