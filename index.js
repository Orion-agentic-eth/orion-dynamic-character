import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";

// Update SCHEMA_ID to the schema id of your new Personalized AI Assistant User Profiles collection
const SCHEMA_ID = "d575938b-2ee6-4f17-ba93-4eeb6cf9c4d9";

// Personalized AI Assistant User Profiles Data to add to the collection
// $allot signals that the field will be encrypted to a $share on each node
const data = [
  {
    userProfile: {
      name: { $allot: "Alice Smith" },
      personalDetails: {
        age: 30,
        gender: "female",
        location: "New York, USA",
      },
      bio: [
        "Experienced marketing professional passionate about technology and innovation.",
        "Avid fitness enthusiast who believes in balancing work and health.",
      ],
      health: {
        currentFitnessLevel: "intermediate",
        workoutPreferences: ["HIIT", "Yoga", "Running"],
        goals: [
          "Increase cardiovascular endurance",
          "Improve flexibility",
          "Build lean muscle",
        ],
        currentRoutine: "Gym 3 times per week with morning cardio sessions",
      },
      work: {
        profession: "Marketing Manager",
        industry: "Tech",
        skills: ["Digital Marketing", "Content Strategy", "SEO"],
        goals: [
          "Expand professional network",
          "Attend industry events",
          "Develop leadership skills",
        ],
      },
      interests: [
        "Technology",
        "Health & Fitness",
        "Networking",
        "Personal Development",
      ],
    },
    recommendations: {
      workout: {
        suggestion:
          "Based on your intermediate level and preference for HIIT, consider joining a 45-minute HIIT class at your local gym. This can help improve your endurance while fitting into your busy schedule.",
        details: {
          frequency: "3 sessions per week",
          duration: "45 minutes per session",
          intensity: "moderate to high",
        },
      },
      events: [
        {
          eventName: "Tech Marketing Summit",
          location: "San Francisco, CA",
          date: "2025-03-15",
          description:
            "A premier event for marketing professionals in the tech industry, featuring workshops and networking sessions.",
        },
        {
          eventName: "Local Fitness Meetup",
          location: "New York, NY",
          date: "2025-02-20",
          description:
            "A community event that combines group workouts with health tips, ideal for someone who loves staying active.",
        },
      ],
    },
    assistantStyle: {
      tone: "motivational",
      language: "friendly and supportive",
      communication: {
        greeting:
          "Hi there, I'm here to help you balance your career and health goals!",
        followUp:
          "Would you like more details on the workout plan or the upcoming events?",
      },
    },
    chatExamples: [
      {
        user: "Alice",
        message:
          "I'm struggling to find time for workouts while managing my work.",
      },
      {
        user: "assistant",
        message:
          "I understand how challenging that can be. Considering your busy schedule and goal to boost endurance, I suggest trying a morning HIIT session. It’s efficient and can jumpstart your day!",
      },
      {
        user: "Alice",
        message:
          "Any events coming up that could help with my professional growth?",
      },
      {
        user: "assistant",
        message:
          "Absolutely! There's the Tech Marketing Summit in San Francisco on March 15, which would be a fantastic opportunity for networking and learning the latest industry trends.",
      },
    ],
  },
  {
    userProfile: {
      name: { $allot: "Bob Johnson" },
      personalDetails: {
        age: 40,
        gender: "male",
        location: "San Francisco, USA",
      },
      bio: [
        "Seasoned software engineer with a passion for AI and blockchain.",
        "Enthusiastic about staying fit and achieving a work-life balance.",
      ],
      health: {
        currentFitnessLevel: "advanced",
        workoutPreferences: ["Weightlifting", "Cycling"],
        goals: ["Build strength", "Increase endurance", "Reduce stress"],
        currentRoutine:
          "Cycling 4 times per week and weightlifting 2 times per week",
      },
      work: {
        profession: "Software Engineer",
        industry: "Tech",
        skills: ["Python", "Blockchain", "AI/ML"],
        goals: [
          "Contribute to open source projects",
          "Improve technical skills",
          "Expand professional network",
        ],
      },
      interests: [
        "Blockchain",
        "Artificial Intelligence",
        "Cycling",
        "Gadgets",
      ],
    },
    recommendations: {
      workout: {
        suggestion:
          "Given your advanced fitness level, a combination of strength training and high-intensity cycling might be perfect for you.",
        details: {
          frequency: "4 sessions per week",
          duration: "1 hour per session",
          intensity: "high",
        },
      },
      events: [
        {
          eventName: "Blockchain Developer Conference",
          location: "Las Vegas, NV",
          date: "2025-04-10",
          description:
            "A conference that brings together top blockchain developers and innovators.",
        },
      ],
    },
    assistantStyle: {
      tone: "professional",
      language: "concise and informative",
      communication: {
        greeting: "Hello Bob, ready to level up your fitness and career?",
        followUp:
          "Let me know if you need more details about your workout or event recommendations.",
      },
    },
    chatExamples: [
      {
        user: "Bob",
        message: "I need recommendations for a challenging workout routine.",
      },
      {
        user: "assistant",
        message:
          "Considering your advanced level, I suggest mixing high-intensity cycling with weightlifting to target strength and endurance. How does that sound?",
      },
    ],
  },
];

async function main() {
  try {
    // Create a secret vault wrapper and initialize the SecretVault collection using the personalized schema
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Write collection data to nodes encrypting the specified fields ahead of time
    const dataWritten = await collection.writeToNodes(data);
    console.log(
      "✅ Data written to nodes:",
      JSON.stringify(dataWritten, null, 2)
    );

    // Get the ids of the SecretVault records created
    const newIds = [
      ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
    ];
    console.log("Uploaded record ids:", newIds);

    // Read all collection data from the nodes, decrypting the specified fields
    const decryptedCollectionData = await collection.readFromNodes({});

    // Log first few records (limit to length of data array)
    console.log(
      "Most recent records",
      decryptedCollectionData.slice(0, data.length)
    );
  } catch (error) {
    console.error("❌ SecretVaultWrapper error:", error.message);
    process.exit(1);
  }
}

main();
