let abortController = null; // AbortController for fetch requests
let typewriterTimeout = null; // Timeout ID for typewriter effect
let storyBuffer = ''; // Store buffered story content


// Check if device has a small screen size (mobile)
const isSmallScreen = () => {
    return window.innerWidth <= 768; // Typical breakpoint for mobile screens
};

// Disable app for small screen sizes
if (isSmallScreen()) {
    const mobileMessage = document.getElementById('mobile-message');
    if (mobileMessage) {
        mobileMessage.style.display = 'flex'; // Show mobile message
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        console.warn("Small screen detected. Redirecting user to desktop recommendation.");
    } else {
        console.error("[ERROR] Mobile message element not found in HTML.");
    }
} else {
    console.log("Large screen detected. App is enabled.");
}

// Show Story Container on Load
const showStoryContainer = () => {
    const container = document.getElementById('story-container');
    if (container) {
        container.style.display = 'block'; // Ensure visible
        container.style.visibility = 'visible';
        console.log("[DEBUG] Story container is visible.");
    } else {
        console.error("[ERROR] Story container not found.");
    }
};

// Loading Overlay and Story Container Management

// Show Loading Overlay
const showLoadingOverlay = () => {
    const overlay = document.getElementById('loading-overlay');
    console.log("[DEBUG] Showing loading overlay:", overlay); // Log for debugging
    if (overlay) {
        overlay.style.display = 'flex';
    } else {
        console.error("[ERROR] Loading overlay not found.");
    }
};

// Hide Loading Overlay
// Hide Loading Overlay
const hideLoadingOverlay = () => {
    const overlay = document.getElementById('loading-overlay');
    console.log("[DEBUG] Hiding loading overlay:", overlay); // Log for debugging
    if (overlay) {
        overlay.style.display = 'none'; // Immediately hide overlay
    } else {
        console.error("[ERROR] Loading overlay not found.");
    }
};

// Update Story Container with Paragraph Breaks and Typewriter Effect
const updateStoryContainer = (story) => {
    const storyContainer = document.getElementById('story-content');
    console.log("[DEBUG] Updating story container:", story);

    if (!storyContainer) {
        console.error("[ERROR] Story container not found.");
        return;
    }

    const container = document.getElementById('story-container');
    container.style.display = 'block';
    container.style.visibility = 'visible';
    storyContainer.style.color = 'white'; // Ensure text is white

    // Clear previous content
    storyContainer.innerHTML = '';

    // Parse JSON response if needed
    let parsedStory;
try {
    const jsonData = JSON.parse(story);
    parsedStory = typeof jsonData.story === "string" 
        ? jsonData.story // Use plain string directly
        : JSON.stringify(jsonData.story); // Handle object fallback
} catch (e) {
    parsedStory = story; // Use raw text if JSON parsing fails
}


    // Typewriter Effect
    let index = 0;
    const typeWriter = () => {
        if (index < parsedStory.length) {
            storyContainer.innerHTML += parsedStory.charAt(index); // Add one character at a time
            index++;
            setTimeout(typeWriter, 25); // Typing speed (adjustable)
        }
    };

    hideLoadingOverlay(); // Hide overlay immediately when streaming begins
    typeWriter(); // Start typing animation
};


// Global Variables
let scene, camera, renderer, controls; // Declare variables globally

// Load Background
const loadBackground = () => {
    console.log("Loading background...");
    const loader = new THREE.TextureLoader();
    loader.load('assets/background.png', function (texture) {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
    
        sphere.rotation.y = -Math.PI / 2; // Fix rotation value if needed
        console.log("Background loaded successfully.");
    }); // Closing bracket should match
}    

// Buttons for Spreads
const createButtons = () => {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';
    document.body.appendChild(buttonsContainer);

    const spreads = [
        { label: 'Single Card', type: 'single' },
        { label: 'Three-Card Spread', type: 'three' },
        { label: 'Celtic Cross', type: 'celtic' },
        { label: 'Four-Card Spread', type: 'four' },
        { label: 'Horseshoe Spread', type: 'horseshoe' },
    ];

    spreads.forEach(spread => {
        const button = document.createElement('button');
        button.textContent = spread.label;
        button.addEventListener('click', () => handleSpread(spread.type));
        buttonsContainer.appendChild(button);
    });
};

// Initialize App
const initializeApp = () => {
    console.log("Initializing app...");

    // Make story container visible immediately
    showStoryContainer();

    // Initialize the scene
    console.log("Initializing scene...");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting setup
    console.log("Adding lighting...");
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(ambientLight, directionalLight);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement); // Assign to global variable
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.3;
    camera.position.z = 10;

   // Load background
loadBackground();

// Fetch tarot descriptions JSON file
fetch('/tarot-descriptions.json')
  .then(response => response.json())
  .then(data => {
      tarotDescriptions = data; // Save data to global variable
      console.log("Tarot descriptions loaded successfully:", tarotDescriptions);
  })
  .catch(error => console.error('Error loading JSON:', error));


    // Create buttons
    createButtons();

    // Attach Mouse Events for Tooltip AFTER Renderer Initialization
    renderer.domElement.addEventListener('mousemove', handleCardInteraction);
    renderer.domElement.addEventListener('click', handleCardInteraction);
    renderer.domElement.addEventListener('touchstart', handleCardInteraction);

    console.log("Event listeners for tooltips attached.");

    // Start animation
    animate(); // Calls animate outside this scope
};

// Animate Scene
const animate = () => {
    requestAnimationFrame(animate); // Recursively calls itself
    controls.update(); // Now this works because 'controls' is global
    renderer.render(scene, camera); // Render the scene
};

// Run Initialization After DOM Loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing app...");
    initializeApp(); // App initialization
});

// Tarot Variables
const cardMeshes = [];
const loader = new THREE.TextureLoader();
let tarotDescriptions = {};
let tarotReversed = {};
let loadingComplete = false;



// Fetch Descriptions from JSON and prepare the training data
console.log("Fetching tarot descriptions...");
fetch('tarot-descriptions.json')
  .then(response => response.json())
  .then(data => {
    tarotDescriptions = data;
    console.log("Tarot descriptions loaded:", tarotDescriptions);
  })
  .catch(error => console.error('Error loading tarot descriptions:', error));


// AbortController for managing streams
let currentStreamController = null;

// Stream Story with Typewriter Effect and AbortController
const streamStoryResponse = async (response) => {
    console.log("[DEBUG] Starting streamStoryResponse...");

    // Abort any active fetch or timeout
    if (abortController) {
        console.log("[INFO] Aborting previous stream...");
        abortController.abort(); // Cancel previous request
    }
    if (typewriterTimeout) {
        console.log("[INFO] Clearing previous typewriter timeout...");
        clearTimeout(typewriterTimeout); // Cancel any active typewriter effect
    }

    // Reset global variables
    abortController = new AbortController();
    storyBuffer = ''; // Clear the buffer
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const storyContainer = document.getElementById('story-content');
    if (!storyContainer) {
        console.error("[ERROR] Story container not found.");
        hideLoadingOverlay();
        return;
    }

    // Prepare container for text
    console.log("[DEBUG] Story container reset.");
    storyContainer.innerHTML = ''; // Clear previous content
    storyContainer.style.color = 'white'; // Set text color
    const container = document.getElementById('story-container');
    container.style.display = 'block';
    container.style.visibility = 'visible';

    // Hide loading overlay immediately
    hideLoadingOverlay();

    console.log("[DEBUG] Variables reset.");

    let result = ''; // Store the streamed text
    let index = 0; // Index for typewriter animation

    // Start reading the stream
    console.log("[DEBUG] Reading stream...");
    try {
        while (true) {
            const { value, done } = await reader.read(); // Read each chunk
            if (done) break; // End stream if no more data

            // Decode chunk and append it to the buffer
            const text = decoder.decode(value, { stream: true });
            console.log("[DEBUG] Received chunk:", text); // Log received data
            storyBuffer += text; // Append new text to buffer

            // Check if the story is wrapped in JSON (e.g., {"story": "text"})
            let parsedStory;
            try {
                const jsonData = JSON.parse(storyBuffer); // Attempt JSON parse
                parsedStory = jsonData.story || storyBuffer; // Use 'story' or fallback
            } catch (e) {
                parsedStory = storyBuffer; // Use as-is if parsing fails
            }

            console.log("[DEBUG] Parsed story:", parsedStory);

            // Start the typewriter effect
            const typeWriter = () => {
                if (index < parsedStory.length) {
                    storyContainer.innerHTML += parsedStory.charAt(index); // Add one character
                    index++;
                    typewriterTimeout = setTimeout(typeWriter, 25); // Speed: 25ms
                } else {
                    console.log("[DEBUG] Typewriter complete.");
                }
            };

            if (index === 0) { // Only start typewriter if not already running
                console.log("[DEBUG] Starting typewriter animation...");
                typeWriter();
            }
        }

        console.log("[DEBUG] Stream fully processed.");

    } catch (error) {
        console.error("[ERROR] Failed to stream story:", error.message);
    }
};






// Load Selected Cards and Update Story
const loadSelectedCards = async (selectedFiles, positions, spreadType) => {
    console.log("Loading selected cards:", selectedFiles);
    cardMeshes.forEach(mesh => scene.remove(mesh)); // Clear previous meshes
    cardMeshes.length = 0; // Reset cardMeshes array
  
    const geometry = new THREE.PlaneGeometry(2, 3.5); // Define card size
    const loader = new THREE.TextureLoader(); // Texture loader for card images
    let loadedCount = 0; // Track number of loaded cards
  
    selectedFiles.forEach((file, index) => {
      // Update the path to match 'cards/' without 'assets/'
      const filePath = `${file}`;
      console.log(`[DEBUG] Loading card path: ${filePath}`);
  
      loader.load(filePath, async (texture) => {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });
  
        const card = new THREE.Mesh(geometry, material);
  
        // Attach JSON Data to Card
        let cardData = {
          name: "Unknown",
          description: "No description available.",
          reversed: "No reversed description available."
        };
  
        // Match the selected card image with descriptions from JSON
        Object.keys(tarotDescriptions).forEach(category => {
          tarotDescriptions[category].forEach(cardInfo => {
            // Match based on updated image path
            if (cardInfo.image === file) { // Compare against plain 'cards/' path
              cardData = {
                name: cardInfo.name,
                description: cardInfo.description,
                reversed: cardInfo.reversed,
              };
            }
          });
        });
  
        console.log(`[DEBUG] Bound data to card: ${cardData.name}`);
  
        // Assign data to the card
        card.userData = cardData;
  
        // Set position and rotation
        card.position.set(0, 0, -10);
        card.rotation.set(0, Math.PI, 0);
  
        // Randomly flip card (25% probability)
        if (Math.random() < 0.25) {
          card.rotation.x = Math.PI;
        }
  
        // Add card to scene
        scene.add(card);
        cardMeshes.push(card);
  
        // Animate position and spinning effect
        gsap.fromTo(
          card.position,
          { x: 0, y: 0, z: -20 }, // Start far away
          {
            x: positions[index].x,
            y: positions[index].y,
            z: 0, // Move closer
            duration: 1.5,
            ease: "power2.out" // Smooth easing
          }
        );
  
        gsap.fromTo(
          card.rotation,
          { y: Math.PI * 2 }, // Start with a full spin
          { y: 0, duration: 1.5, ease: "power2.out" } // Rotate to upright
        );
  
        // Count loaded cards
        loadedCount++;
        if (loadedCount === selectedFiles.length) {
          loadingComplete = true;
          console.log("[DEBUG] Loading complete.");
  
          // Prepare card data for request
          const cardsData = cardMeshes.map(mesh => ({
            name: mesh.userData.name,
            description: mesh.userData.description,
            reversed: mesh.userData.reversed,
          }));
  
          console.log("[DEBUG] Sending Cards Data:", cardsData);
  
          // Show loading overlay
          showLoadingOverlay(); 

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
  
          fetch('/generate-tarot-story', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              spreadType: spreadType,
              cards: cardsData,
            }),
          })
            .then(response => {
              streamStoryResponse(response); // Call streaming function
            })
            .catch(error => {
              console.error("[ERROR] Failed to fetch story:", error.message);
              hideLoadingOverlay(); // Hide overlay if error occurs
            });
        }
      }, 
      undefined, // OnProgress callback (optional)
      (err) => {
        console.error(`[ERROR] Failed to load texture: ${filePath}`, err);
      });
    });
  };
  

// Get Random Cards
const getRandomCards = (count) => {
  console.log(`Selecting ${count} random cards...`);

  // Extract all card image paths from tarotDescriptions
  const cardNames = Object.values(tarotDescriptions).flatMap(category => category.map(card => card.image));
  const selectedCards = [];
  const indices = [];

  while (indices.length < count) {
    const randomIndex = Math.floor(Math.random() * cardNames.length);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
      selectedCards.push(cardNames[randomIndex]);
    }
  }

  console.log("Selected cards:", selectedCards);
  return selectedCards;
};

const handleSpread = (spread) => {
    console.log(`Handling spread: ${spread}`);

    // Abort previous fetch if active
    if (abortController) {
        console.log("[INFO] Aborting previous stream...");
        abortController.abort(); // Cancel the previous fetch
    }

    // Reset abort controller and start a new one
    abortController = new AbortController();
    const signal = abortController.signal; // Signal for fetch request

    let selectedFiles = [];
    let positions = [];

    if (spread === 'single') {
        selectedFiles = getRandomCards(1);
        positions = [{ x: 0, y: 0 }];
    } else if (spread === 'three') {
        selectedFiles = getRandomCards(3);
        positions = [{ x: -5, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 }];
    } else if (spread === 'four') {
        selectedFiles = getRandomCards(4);
        positions = [{ x: -3, y: 2 }, { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 0, y: -2 }];
    } 
    // Fix for 'Celtic Cross' Spread
    else if (spread === 'celtic') {
        selectedFiles = getRandomCards(10); // 10 cards for Celtic Cross
        positions = [
            { x: 0, y: 0 },      // 1. Present (Center)
            { x: 0, y: -2 },     // 2. Challenge (Above Present)
            { x: -3, y: 0 },     // 3. Subconscious (Left)
            { x: 3, y: 0 },      // 4. Past (Right)
            { x: 0, y: -4 },     // 5. Goal (Top Center)
            { x: 0, y: 4 },      // 6. Near Future (Bottom Center)
            { x: -6, y: 2 },     // 7. Approach (Bottom Left)
            { x: 6, y: 2 },      // 8. Environment (Bottom Right)
            { x: -6, y: -2 },    // 9. Hopes and Fears (Top Left)
            { x: 6, y: -2 }      // 10. Outcome (Top Right)
        ];
    }
    
    // Fix for 'Horseshoe' Spread
    else if (spread === 'horseshoe') {
        selectedFiles = getRandomCards(7); // 7 cards for Horseshoe Spread
        positions = [
            { x: 0, y: 5 },    // Card 1
            { x: -6, y: 3 },   // Card 2
            { x: -3, y: 0 },   // Card 3
            { x: 0, y: -2 },   // Card 4
            { x: 3, y: 0 },    // Card 5
            { x: 6, y: 3 },    // Card 6
            { x: 0, y: -6 }    // Card 7
        ];
    }

    loadSelectedCards(selectedFiles, positions, spread, signal);
};

// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Tooltip Setup
const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
tooltip.style.color = 'white';
tooltip.style.padding = '10px';
tooltip.style.borderRadius = '5px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1000';
tooltip.style.maxWidth = '300px';
document.body.appendChild(tooltip);

// Display Tooltip
const showTooltip = (name, description, reversed, x, y, isReversed) => {
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
        <strong>${name}</strong><br/>
        <strong>${isReversed ? 'Reversed:' : 'Upright:'}</strong> 
        ${isReversed ? reversed : description}
    `;

    // Ensure tooltip stays within viewport
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tooltip.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
        tooltip.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
};

// Hide Tooltip
const hideTooltip = () => {
    tooltip.style.display = 'none';
};


// Handle Hover and Click Events
const handleCardInteraction = (event) => {
    if (!loadingComplete) return;

    const rect = renderer.domElement.getBoundingClientRect();
    let x, y;
    if (event.type === 'touchstart') {
        event.preventDefault();
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }

    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
        const intersectedCard = intersects[0].object;
        const isReversed = Math.abs(intersectedCard.rotation.x) > 0.1;

        if (event.type === 'mousemove') {
            // Hover Effect - Show Tooltip
            showTooltip(
                intersectedCard.userData.name,
                intersectedCard.userData.description,
                intersectedCard.userData.reversed,
                x,
                y,
                isReversed
            );
        } else if (event.type === 'click') {
            // Click Effect - Placeholder (Optional future expansion)
            console.log("Clicked card:", intersectedCard.userData.name);
        }
    } else {
        hideTooltip();
    }
};