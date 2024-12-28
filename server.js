import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("[DEBUG] OPENAI_KEY:", process.env.OPENAI_KEY ? "Key is set" : "Key is missing!");

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
    `;

    try {
        console.log("[DEBUG] Story Prompt:", storyPrompt);

        // Create thread and run in a single API call
        console.log("[INFO] Creating thread and running assistant...");
        const run = await openai.beta.threads.createAndRun({
            assistant_id: assistantId,
            thread: {
                messages: [
                    {
                        role: "user",
                        content: storyPrompt,
                    },
                ],
            },
        });

        console.log("[INFO] Run created:", run);

        // Polling for run completion
        let attempts = 0;
        const maxAttempts = 15; // Limit to 30 seconds (15 attempts)
        let runStatus = run.status;

        while (runStatus !== 'completed' && attempts < maxAttempts) {
            console.log(`[INFO] Checking run status... Attempt ${attempts + 1}/${maxAttempts}`);
            const runCheck = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);

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
        const messages = await openai.beta.threads.messages.list(run.thread_id);

        // Extract assistant's response
        const response = messages.data
            .filter(msg => msg.role === 'assistant')
            .map(msg => {
                const content = msg.content;
                if (Array.isArray(content) && content[0]?.text?.value) {
                    return content[0].text.value;
                }
                return "No meaningful response generated.";
            })
            .join("\n");

        console.log("[INFO] Story generated successfully.");
        res.send({ story: response });

    } catch (error) {
        console.error("[ERROR] Error generating story:", error.message);
        if (error.response) {
            console.error("[ERROR] Response Data:", error.response.data);
            console.error("[ERROR] Headers:", error.response.headers);
        }
        res.status(500).send({
            error: error.message,
            details: error.response ? error.response.data : "No additional error details."
        });
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
    console.log(`Server is running on port ${port}`);
});

