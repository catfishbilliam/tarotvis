import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY, // Ensure OPENAI_KEY is set in .env
});

// Create Express App
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Assistant Configuration
const assistantId = "asst_9kYccjfnF9E4N243zlsUtFZN"; // Replace with your OpenAI Assistant ID

app.post("/generate-tarot-story", async (req, res) => {
    console.log("[INFO] Received request to generate tarot story.");

    const { cards, spreadType } = req.body;
    console.log("[DEBUG] Cards:", cards);
    console.log("[DEBUG] Spread Type:", spreadType);

    const phases = getPhases(spreadType);
    let storyPrompt = `You are a tarot reader. Interpret the following spread:\n\n`;

    // Construct prompt
    cards.forEach((card, index) => {
        const phase = phases[index] || `Phase ${index + 1}`;
        storyPrompt += `
        Phase: ${phase}
        Card: ${card.name}
        Upright Meaning: ${card.description}
        Reversed Meaning: ${card.reversed}
        ---\n`;
    });

    storyPrompt += `
        Provide a meaningful narrative that expands on upright and reversed interpretations.
        Use the vector store to enhance insights about meanings and relationships.
    `;

    try {
        console.log("[INFO] Creating thread...");
        const thread = await openai.beta.threads.create();

        console.log("[INFO] Adding user message...");
        await openai.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: storyPrompt,
        });

        console.log("[INFO] Running assistant...");
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
            stream: true, // Enable streaming
            tools: [{ type: "file_search" }]
        });

        console.log("[INFO] Streaming response...");

        // Stream response to the client
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        run.on('data', chunk => {
            if (chunk.choices) {
                const text = chunk.choices[0]?.delta?.content;
                if (text) {
                    console.log(text); // Log streaming data
                    res.write(text); // Send chunk to the client
                }
            }
        });

        run.on('end', () => {
            console.log("[INFO] Streaming complete.");
            res.end();
        });

        run.on('error', (err) => {
            console.error("[ERROR] Streaming failed:", err);
            res.status(500).end();
        });

    } catch (error) {
        console.error("[ERROR] Error generating story:", error.message);
        res.status(500).send("Error generating story.");
    }
});



// Helper function for phases
const getPhases = (spreadType) => {
    const phases = {
        single: ["Insight"],
        three: ["Past", "Present", "Future"],
        four: ["Situation", "Challenge", "Advice", "Outcome"],
        celtic: [
            "Present", "Challenge", "Subconscious", "Past",
            "Goal", "Near Future", "Approach", "Environment",
            "Hopes and Fears", "Outcome"
        ],
        horseshoe: [
            "Influences", "Challenges", "Opportunities",
            "Advice", "Near Future", "Obstacles", "Final Outcome"
        ]
    };
    return phases[spreadType] || [`Phase ${index + 1}`];
};

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
