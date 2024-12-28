import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY, // Ensure OPENAI_KEY is set in .env
});

// Netlify Serverless Function Handler
export async function handler(event) {
    try {
        const { cards, spreadType } = JSON.parse(event.body);

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

        console.log("[INFO] Sending request to OpenAI...");

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: storyPrompt }],
        });

        console.log("[INFO] Story generated successfully.");

        // Return response
        return {
            statusCode: 200,
            body: JSON.stringify({ story: response.choices[0].message.content }),
        };
    } catch (error) {
        console.error("[ERROR] Error generating story:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}

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
