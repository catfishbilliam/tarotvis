import json

# Read the JSON file
with open(r'C:\Users\conwa\OneDrive\Documents\tarot\tarot_descriptions.json') as file:
    data = json.load(file)

# Function to add 'cards/' before file names
def add_cards_prefix(obj):
    if isinstance(obj, dict):
        return {k: add_cards_prefix(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [add_cards_prefix(elem) for elem in obj]
    elif isinstance(obj, str) and obj.endswith(('.jpg', '.png', '.gif')):
        return 'cards/' + obj
    else:
        return obj

# Modify the data
modified_data = add_cards_prefix(data)

output_path = r'C:\Users\conwa\OneDrive\Documents\tarot\modified_tarot_descriptions.json'
with open(output_path, 'w') as file:
    json.dump(modified_data, file, indent=2)
print(f"Modified JSON file has been saved as '{output_path}'")
