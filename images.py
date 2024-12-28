import json
import os

# Paths to input and output files
input_path = r'C:\Users\conwa\OneDrive\Documents\tarot\public\tarot_descriptions.json'
output_path = r'C:\Users\conwa\OneDrive\Documents\tarot\public\tarot_descriptions_fixed.json'

# Read the JSON file
with open(input_path, 'r') as file:
    data = json.load(file)

# Function to fix file paths
def fix_file_paths(obj):
    if isinstance(obj, dict):
        return {k: fix_file_paths(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_file_paths(elem) for elem in obj]
    elif isinstance(obj, str) and obj.startswith('assets/cards/'):
        # Remove 'assets/' from the path
        return obj.replace('assets/', '')
    else:
        return obj

# Update the paths in the JSON data
fixed_data = fix_file_paths(data)

# Save the updated JSON file
with open(output_path, 'w') as file:
    json.dump(fixed_data, file, indent=2)

print(f"Fixed JSON file has been saved as '{output_path}'")
