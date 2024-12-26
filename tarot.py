import cv2
import numpy as np
import os
import glob

# Set input and output directories
input_dir = r'C:\Users\conwa\OneDrive\Documents\tarot'  # Your folder path
output_dir = os.path.join(input_dir, 'output_cards')  # Output folder
os.makedirs(output_dir, exist_ok=True)  # Create output directory if it doesn't exist

# Match all tarot card image files
file_pattern = os.path.join(input_dir, 'Rider-Waite-Tarot-Deck-*.png')
files = glob.glob(file_pattern)

# Process each file
for file_path in files:
    # Load the image
    image = cv2.imread(file_path)
    if image is None:
        print(f"Failed to load {file_path}")
        continue

    # Convert to HSV for color masking
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define white color range for masking (adjust if needed)
    lower_white = np.array([0, 0, 200])  # Lower boundary for white
    upper_white = np.array([180, 30, 255])  # Upper boundary for white

    # Create mask to detect cards against a white background
    mask = cv2.inRange(hsv, lower_white, upper_white)
    mask = cv2.bitwise_not(mask)  # Invert mask

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Process each contour
    card_count = 0
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    for contour in contours:
        # Get bounding box for each detected contour
        x, y, w, h = cv2.boundingRect(contour)

        # Filter out very small or narrow areas (likely noise)
        if w > 100 and h > 200:  # Adjust thresholds if needed
            # Enforce 3:5 aspect ratio (portrait tarot card size)
            target_ratio = 3 / 5
            height = h
            width = int(height * target_ratio)
            if width > w:  # Adjust width if too small
                diff = (width - w) // 2
                x = max(0, x - diff)
                w = width

            # Add padding to avoid cutting off edges
            padding = 10  # Adjust padding if necessary
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(image.shape[1], x + w + padding)
            h = min(image.shape[0], y + h + padding)

            # Crop and save the detected card
            card = image[y:h, x:w]
            card_count += 1
            output_path = os.path.join(output_dir, f'{base_name}_card_{card_count}.png')
            cv2.imwrite(output_path, card)

    print(f"Processed {base_name}: Extracted {card_count} cards.")

print("All images processed successfully!")
