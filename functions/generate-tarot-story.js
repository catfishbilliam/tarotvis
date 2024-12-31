import express from 'express';
import serverless from 'serverless-http';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

// Create Express App
const app = express();
app.use(express.json());

// Tarot Story Generator Route
app.post("/generate-tarot-story", async (req, res) => {
    console.log("[INFO] Received request to generate tarot story.");

    const { cards, spreadType } = req.body;
    console.log("[DEBUG] Cards:", cards);
    console.log("[DEBUG] Spread Type:", spreadType);

    // Validate input
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({ error: "Invalid card data provided." });
    }

    try {
        // Generate story prompt
        const phases = ["Past", "Present", "Future"];
        let storyPrompt = `You are a tarot reader providing interpretations for the following spread:\n\n`;

        cards.forEach((card, index) => {
            const phase = phases[index] || `Phase ${index + 1}`;
            storyPrompt += `Phase: ${phase}\nCard: ${card.name}\nMeaning: ${card.description}\n---\n`;
        });

        storyPrompt += "\nProvide a meaningful narrative based on these cards.";

        console.log("[DEBUG] Story Prompt:", storyPrompt);

        // Make request to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Replace with "gpt-4" if needed
            messages: [
                { role: "system", content: "You are a tarot reader providing interpretations." },
                { role: "user", content: storyPrompt }
            ],
            max_tokens: 500,
        });

        console.log("[DEBUG] OpenAI Response:", JSON.stringify(response, null, 2));

        // Extract story from the response
        const story = response.choices && response.choices[0] && response.choices[0].message.content
            ? response.choices[0].message.content.trim()
            : "Sorry, no story could be generated.";

        // Send response
        res.json({ story });
        console.log("[INFO] Story generated successfully.");
    } catch (error) {
        console.error("[ERROR] Error generating story:", error.message);

        // Send error response
        res.status(500).json({
            error: "Failed to generate story.",
            details: error.message,
        });
    }
});

// Export as Netlify Function
export const handler = serverless(app);
