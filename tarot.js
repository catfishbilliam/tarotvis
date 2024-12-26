// Scene Setup
console.log("Initializing scene...");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
console.log("Adding lighting...");
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(ambientLight, directionalLight);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

// Background Sphere
const loadBackground = () => {
  console.log("Loading background...");
  const loader = new THREE.TextureLoader();
  loader.load('images/background.png', (texture) => {
    const geometry = new THREE.SphereGeometry(50, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.rotation.y = -Math.PI / -2; // Slightly turned left
    console.log("Background loaded successfully.");
  });
};

// Tarot Variables
const cardMeshes = [];
const loader = new THREE.TextureLoader();
let tarotDescriptions = {};
let loadingComplete = false; // Flag to track loading completion

// Fetch Descriptions from JSON
console.log("Fetching tarot descriptions...");
fetch('tarot_descriptions.json')
  .then(response => response.json())
  .then(data => {
    tarotDescriptions = data;
    console.log("Tarot descriptions loaded:", tarotDescriptions);
  })
  .catch(error => console.error('Error loading tarot descriptions:', error));

// Tooltip Setup
const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
tooltip.style.color = 'white';
tooltip.style.padding = '10px';
tooltip.style.borderRadius = '5px';
tooltip.style.display = 'none'; // Initially hidden
document.body.appendChild(tooltip);

// Display Tooltip
const showTooltip = (name, description, x, y) => {
  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
  tooltip.style.display = 'block';
  tooltip.innerHTML = `<strong>${name}</strong><br/>${description}`;
};

// Hide Tooltip
const hideTooltip = () => {
  tooltip.style.display = 'none';
};

// Get Random Cards
const getRandomCards = (count) => {
  console.log(`Selecting ${count} random cards...`);
  const cardNames = Object.values(tarotDescriptions).flat().map(card => card.image);
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

// Load Selected Cards
// Load Selected Cards
const loadSelectedCards = (selectedFiles, positions) => {
    console.log("Loading selected cards:", selectedFiles);
    cardMeshes.forEach(mesh => scene.remove(mesh)); // Clear previous cards
    cardMeshes.length = 0; // Reset array
  
    const geometry = new THREE.PlaneGeometry(2, 3.5); // Tarot card size
    let loadedCount = 0; // Track loaded cards
  
    selectedFiles.forEach((file, index) => {
      loader.load(`cards/${file}`, (texture) => {
        const material = new THREE.MeshBasicMaterial({ 
          map: texture, 
          transparent: true,
          side: THREE.DoubleSide // Fix for visibility issues
        });
        const card = new THREE.Mesh(geometry, material);
  
        // Attach JSON Data to Card
        let cardData = { name: "Unknown", description: "No description available" };
        Object.keys(tarotDescriptions).forEach(category => {
          tarotDescriptions[category].forEach(cardInfo => {
            if (cardInfo.image === file) {
              cardData = { name: cardInfo.name, description: cardInfo.description };
            }
          });
        });
        card.userData = cardData; // Store data in card object
        console.log("Card loaded:", cardData);
  
        // Set position and rotation
        card.position.set(0, 0, -10);
        card.rotation.set(0, Math.PI, 0); // Default rotation
  
        // Randomly flip card (turn it upside down) with reduced probability (25%)
        if (Math.random() < 0.15) { // 25% chance to flip the card
          card.rotation.x = Math.PI; // 180 degrees in radians
        }
  
        scene.add(card);
        cardMeshes.push(card); // Add to mesh array for raycaster
        console.log(`[Debug] Added to cardMeshes: ${cardData.name}`);
  
        // Animate position and flip
        gsap.to(card.position, {
          x: positions[index].x,
          y: positions[index].y,
          z: 0,
          duration: 1,
        });
        gsap.to(card.rotation, { y: 0, duration: 1, delay: 0.5 });
  
        // Count loaded cards
        loadedCount++;
        if (loadedCount === selectedFiles.length) {
          loadingComplete = true; // All cards are loaded
          console.log("[Debug] Loading complete.");
        }
      });
    });
  };
  

// Manual Raycasting for Hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  if (!loadingComplete) {
    return;
  }

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cardMeshes);

  if (intersects.length > 0) {
    const hoveredCard = intersects[0].object;
    showTooltip(hoveredCard.userData.name, hoveredCard.userData.description, event.clientX, event.clientY);
  } else {
    hideTooltip();
  }
});

// Spread Layouts
// Spread Layouts
const handleSpread = (spread) => {
    console.log(`Handling spread: ${spread}`);
    let selectedFiles = [];
    let positions = [];
  
    if (spread === 'single') {
      selectedFiles = getRandomCards(1);
      positions = [{ x: 0, y: 0 }];
    } else if (spread === 'three') {
      selectedFiles = getRandomCards(3);
      positions = [{ x: -5, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 0 }];
    } else if (spread === 'celtic') {
      selectedFiles = getRandomCards(6);
      positions = [
        { x: 0, y: 6 }, { x: -4, y: 0 }, { x: 4, y: 0 }, { x: 0, y: -6 },
        { x: 0, y: 0 }, { x: 0, y: -6 }
      ];
    } else if (spread === 'four') { // Four-Card Spread
      selectedFiles = getRandomCards(4);
      positions = [
        { x: -3, y: 2 }, { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 0, y: -2 }
      ];
    } else if (spread === 'horseshoe') { // Horseshoe Spread
      selectedFiles = getRandomCards(7);
      positions = [
        { x: 0, y: 5 }, { x: -6, y: 3 }, { x: -3, y: 0 }, { x: 0, y: -2 },
        { x: 3, y: 0 }, { x: 6, y: 3 }, { x: 0, y: -6 }
      ];
    }
  
    loadSelectedCards(selectedFiles, positions);
  };

  
  
  // Buttons for Spreads
  const createButtons = () => {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';
    document.body.appendChild(buttonsContainer);
  
    const spreads = [
      { label: 'Single Card', type: 'single' },
      { label: 'Three-Card Spread', type: 'three' },
      { label: 'Celtic Cross', type: 'celtic' },
      { label: 'Four-Card Spread', type: 'four' },  // Added new spread
      { label: 'Horseshoe Spread', type: 'horseshoe' } // Added new spread
    ];
  
    spreads.forEach(spread => {
      const button = document.createElement('button');
      button.textContent = spread.label;
      button.addEventListener('click', () => handleSpread(spread.type));
      buttonsContainer.appendChild(button);
    });
  };
  

// Animate Scene
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

// Initialize Scene
loadBackground();
createButtons();
animate();
