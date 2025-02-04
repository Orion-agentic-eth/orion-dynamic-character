import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure the /character directory exists (create it if necessary)
const characterDir = path.join(process.cwd(), "character");
if (!fs.existsSync(characterDir)) {
  fs.mkdirSync(characterDir, { recursive: true });
  console.log(`Created directory: ${characterDir}`);
}

app.post("/create-character", async (req, res) => {
  // Use the entire request body as a knowledge base.
  // This can include user details, work info, health data, events, etc.
  const knowledgeBase = JSON.stringify(req.body, null, 2);

  // Build a prompt that instructs the model to generate a diversified and detailed character JSON profile.
  // The JSON structure now includes additional "health" and "events" fields.
  const prompt = `
You are to generate a JSON character profile for a personalized AI assistant.
The JSON should follow the structure below (example):

{
  "name": "Character Name",
  "clients": [],
  "modelProvider": "openai",
  "settings": {
    "secrets": {},
    "voice": { "model": "en_US-female-medium" }
  },
  "plugins": [],
  "bio": [ "A brief description of the character and background." ],
  "lore": [ "Additional background details or notable events." ],
  "knowledge": [ "Relevant knowledge or expertise areas." ],
  "health": {
      "currentStatus": "Good/Average/Poor",
      "fitnessLevel": "Beginner/Intermediate/Advanced",
      "healthGoals": ["Goal1", "Goal2"],
      "currentRoutine": "Details of current health routine"
  },
  "events": [
      {
         "eventName": "Event Name",
         "location": "City, Country",
         "date": "YYYY-MM-DD",
         "description": "Description of the event"
      }
  ],
  "messageExamples": [
    [
      { "user": "ExampleUser", "content": { "text": "Sample message?" } },
      { "user": "Character", "content": { "text": "Response message." } }
    ]
  ],
  "postExamples": [ "Example post or statement by the character." ],
  "topics": [ "Topics or areas of discussion." ],
  "style": {
    "all": [ "List of adjectives or style elements" ],
    "chat": [ "Chat style guidelines" ],
    "post": [ "Post style guidelines" ]
  },
  "adjectives": [ "Descriptive", "words" ]
}

Use the following knowledge base to generate a unique, diversified JSON character profile that includes detailed events and health factors:

${knowledgeBase}

Generate only the JSON output and nothing else.
`;

  try {
    // Call the OpenAI Chat Completions API with the prompt.
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

    // Extract and trim the generated content
    const output = response.choices[0].message.content.trim();

    // Parse the output as JSON
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

    // Determine a filename based on the generated character's name (if available) or use a timestamp.
    let filename = "character-" + Date.now() + ".json";
    if (characterJson.name) {
      filename =
        characterJson.name.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Date.now() +
        ".json";
    }
    const filePath = path.join(characterDir, filename);

    // Save the character JSON to the file
    fs.writeFileSync(filePath, JSON.stringify(characterJson, null, 2), "utf8");
    console.log(`Saved character file: ${filePath}`);

    // Return the generated character JSON and file path in the response
    res.json({ character: characterJson, filePath });
  } catch (error) {
    console.error(
      "OpenAI API error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate character JSON" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
