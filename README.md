# Tarot Card Reader

Welcome to the **Tarot Card Reader** app! This interactive tarot reading app lets you explore different tarot card spreads in a 3D environment. You can shuffle and draw cards, view their descriptions, and gain insights into the meanings behind each card. The app features a variety of card spreads, including traditional and custom ones like the **Celtic Cross**, **Three-Card Spread**, and **Single Card Spread**.

## Features

- **Interactive 3D Tarot Visualization**: View and interact with the tarot cards in a 3D environment.
- **Multiple Spreads**: Choose from different card spreads such as:
  - Single Card Spread
  - Three-Card Spread
  - Celtic Cross
  - Four-Card Spread
  - Horseshoe Spread
- **Hover for Card Information**: Hover over a card to display its name and descriptions.
- **Card Flipping**: Cards are randomly flipped upside down to simulate the random nature of tarot readings.
- **Python Script for Card Extraction**: A Python script is included that allows you to cut out tarot cards from downloadable PDFs to be used in the app.

## Technologies Used

- **Three.js**: For 3D rendering of the tarot cards and background environment.
- **GSAP**: For smooth animations of card movement and flipping.
- **HTML5**: For the structure of the page.
- **CSS3**: For styling and responsive design.
- **JavaScript**: For functionality, including card draws, spreads, and interactions.
- **Python**: A Python script (`tarot.py`) is included for extracting tarot cards from downloadable PDFs.

## How to Use

1. **Navigate the App**: Use the provided buttons to select your preferred tarot card spread.
2. **Hover Over Cards**: Hover your mouse over any card to reveal its meaning and description.
3. **Card Animation**: Watch as the cards shuffle and move into position. Some cards may appear upside down randomly.
4. **Extract Cards from PDF**:
   - Use the provided Python script (`tarot.py`) to extract tarot cards from a downloadable PDF.
   - The script will crop and save the individual cards, making them ready for use in the app.
   - If you do download your own cards, you will need to name the cards according to their file naming convention in the (`tarot-descriptions.json`) file.
   - Upload your tarot cards to the images folder.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tarot-card-reader.git
