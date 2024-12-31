import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Validate API key
if (!process.env.OPENAI_KEY) {
    console.error("[ERROR] Missing OpenAI API key!");
    process.exit(1);
}

console.log("[DEBUG] OPENAI_KEY:", process.env.OPENAI_KEY ? "Key is set" : "Key is missing!");
console.log("[DEBUG] NODE_ENV:", process.env.NODE_ENV || "development");
console.log("[DEBUG] PORT:", process.env.PORT || 3000);

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
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

// Health check endpoint
app.get('/health-check', async (req, res) => {
    try {
        console.log("[INFO] Testing OpenAI API connection...");
        const response = await axios.get('https://api.openai.com/v1/engines', {
            headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` },
        });
        res.send({ status: 'ok', data: response.data });
    } catch (error) {
        console.error("[ERROR] OpenAI API connection failed:", error.message);
        res.status(500).send({
            error: "Unable to connect to OpenAI API.",
            details: error.message,
        });
    }
});

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

    // Default to numbered phases if spreadType is missing or invalid
    return phases[spreadType] || Array.from({ length: 10 }, (_, i) => `Phase ${i + 1}`);
};


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
        storyPrompt += `\nPhase: ${phase}\nCard: ${card.name}\nUpright Meaning: ${card.description}\nReversed Meaning: ${card.reversed}\n---\n`;
    });

    storyPrompt += `\nProvide a meaningful narrative that expands on upright and reversed interpretations.`;

    try {
        console.log("[DEBUG] Story Prompt:", storyPrompt);

        // Create thread
        const thread = await openai.beta.threads.create();
        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: storyPrompt,
        });

        // Start assistant run
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
        });

        if (!thread || !thread.id || !run || !run.id) {
            throw new Error("Failed to create thread or run.");
        }

        // Polling for run completion
        let attempts = 0;
        const maxAttempts = 15; // Limit to 30 seconds (15 attempts)
        let runStatus = run.status;

        while (runStatus !== 'completed' && attempts < maxAttempts) {
            console.log(`[DEBUG] Polling run status: ${runStatus}. Attempt: ${attempts + 1}`);
            const runCheck = await openai.beta.threads.runs.retrieve(thread.id, run.id);

            if (runCheck.status === 'completed') {
                runStatus = runCheck.status;
                break;
            } else if (runCheck.status === 'failed') {
                throw new Error("Assistant run failed.");
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
            attempts++;
        }

        if (runStatus !== 'completed') {
            throw new Error("Assistant run timed out.");
        }

        console.log("[INFO] Fetching messages...");
        const messages = await openai.beta.threads.messages.list(thread.id);

        // Extract assistant's response
        const response = messages.data
            .filter(msg => msg.role === 'assistant')
            .map(msg => msg.content[0]?.text?.value || "No meaningful response generated.")
            .join("\n");

        console.log("[INFO] Story generated successfully.");
        res.send({ story: response });

    } catch (error) {
        console.error("[ERROR] Error generating story:", error.message);
        res.status(500).send({
            error: error.message,
            details: error.response ? error.response.data : "No additional error details."
        });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
