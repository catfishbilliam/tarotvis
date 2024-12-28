# Tarot Card Reader

Welcome to the **Tarot Card Reader** app! This interactive tarot reading app lets you explore different tarot card spreads in a 3D environment. You can shuffle and draw cards, view their descriptions, and gain insights into the meanings behind each card. The app features a variety of card spreads, including traditional and custom ones like the **Celtic Cross**, **Three-Card Spread**, and **Single Card Spread**.

## Features

- **Interactive 3D Tarot Visualization**: View and interact with the tarot cards in a 3D environment.
- **Dynamic Storytelling with ChatGPT API**: Uses OpenAI's ChatGPT API to generate rich, dynamic stories based on selected tarot card spreads.
- **Multiple Spreads**: Choose from different card spreads such as:
  - Single Card Spread
  - Three-Card Spread
  - Celtic Cross
  - Four-Card Spread
  - Horseshoe Spread
- **Hover for Card Information**: Hover over a card to display its name and descriptions, including upright and reversed meanings.
- **Card Flipping**: Cards are randomly flipped upside down to simulate the random nature of tarot readings.
- **Story Generation**: Receive AI-generated tarot interpretations and story-driven insights tailored to your selected spread.
- **Python Script for Card Extraction**: A Python script is included that allows you to cut out tarot cards from downloadable PDFs to be used in the app.

## Technologies Used

- **Three.js**: For 3D rendering of the tarot cards and background environment.
- **GSAP**: For smooth animations of card movement and flipping.
- **OpenAI API**: For dynamic story generation and interpretations using GPT models.
- **HTML5**: For the structure of the page.
- **CSS3**: For styling and responsive design.
- **JavaScript**: For functionality, including card draws, spreads, interactions, and API integration.
- **Python**: A Python script (`tarot.py`) is included for extracting tarot cards from downloadable PDFs.

## How to Use

1. **Navigate the App**: Use the provided buttons to select your preferred tarot card spread.
2. **Hover Over Cards**: Hover your mouse over any card to reveal its meaning and description.
3. **Story Generation**: After selecting a spread, the ChatGPT API generates a dynamic story and detailed interpretation based on the chosen cards. The story streams live into the story container.
4. **Card Animation**: Watch as the cards shuffle and move into position. Some cards may appear upside down randomly.
5. **Extract Cards from PDF**:
   - Use the provided Python script (`tarot.py`) to extract tarot cards from a downloadable PDF.
   - The script will crop and save the individual cards, making them ready for use in the app.
   - If you do download your own cards, you will need to name the cards according to their file naming convention in the (`tarot-descriptions.json`) file.
   - Upload your tarot cards to the images folder.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tarot-card-reader.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add your OpenAI API Key:
   - Create a `.env` file in the root directory.
   - Add the following line:
     ```bash
     OPENAI_API_KEY=your-api-key-here
     ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at:
   ```
   http://localhost:3000
   ```

## Environment Variables

- **OPENAI_API_KEY**: Your OpenAI API key is required for accessing the ChatGPT API.

## Storytelling with ChatGPT API

The app integrates the ChatGPT API to dynamically create stories based on the selected tarot cards. After choosing a spread, the card data (including names, upright meanings, and reversed meanings) is sent to the API, which then generates an in-depth story tailored to the chosen cards. The story streams in real-time, adding an immersive and interactive experience.

### Example:
For a three-card spread:
- **Past**: The Fool (upright) - New beginnings.
- **Present**: The Tower (reversed) - Avoiding disaster.
- **Future**: The Star (upright) - Hope and renewal.

**Generated Story:**
"Your journey begins with The Fool, symbolizing fresh starts and uncharted paths. However, The Tower warns you of hidden challenges avoided in the present. Yet, the future shines bright with The Star, guiding you towards hope and transformation."

## Contribution

We welcome contributions to improve the app! If you have suggestions for new features, bug fixes, or enhancements, please submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
Enjoy your tarot journey and uncover the mysteries that await!
