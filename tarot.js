// 
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
      sphere.rotation.y = -Math.PI / -2;
      console.log("Background loaded successfully.");
    });
  };
  
  // Tarot Variables
  const cardMeshes = [];
  const loader = new THREE.TextureLoader();
  let tarotDescriptions = {};
  let tarotReversed = {};
  let loadingComplete = false;
  
  // Fetch Descriptions from JSON
  console.log("Fetching tarot descriptions...");
  fetch('tarot_descriptions.json')
    .then(response => response.json())
    .then(data => {
      tarotDescriptions = data;
      console.log("Tarot descriptions loaded:", tarotDescriptions);
      fetch('tarot_reversed.json')
        .then(response => response.json())
        .then(data => {
          tarotReversed = data;
          console.log("Tarot reverse descriptions loaded:", tarotReversed);
        })
        .catch(error => console.error('Error loading tarot reversed descriptions:', error));
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
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  
  // Display Tooltip
  const showTooltip = (name, description, reversed, x, y, isReversed) => {
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <strong>${name}</strong><br/>
      <strong>Upright:</strong> ${description}<br/>
      <strong>Reversed:</strong> ${reversed}
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
  
  const loadSelectedCards = (selectedFiles, positions) => {
    console.log("Loading selected cards:", selectedFiles);
    cardMeshes.forEach(mesh => scene.remove(mesh));
    cardMeshes.length = 0; // Reset array
  
    const geometry = new THREE.PlaneGeometry(2, 3.5); // Tarot card size
    const loader = new THREE.TextureLoader();
  
    let loadedCount = 0; // Added missing variable declaration
  
    selectedFiles.forEach((file, index) => {
      loader.load(file, (texture) => {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });
        const card = new THREE.Mesh(geometry, material);
  
        // Attach JSON Data to Card
        let cardData = {
          name: "Unknown",
          description: "No description available",
          reversed: "No reversed description available"
        };
  
        Object.keys(tarotDescriptions).forEach(category => {
          tarotDescriptions[category].forEach(cardInfo => {
            if (cardInfo.image === file) {
              cardData = {
                name: cardInfo.name,
                description: cardInfo.description,
                reversed: cardInfo.reversed
              };
            }
          });
        });
        card.userData = cardData;
        console.log("Card loaded:", cardData);
  
        // Set position and rotation
        card.position.set(0, 0, -10);
        card.rotation.set(0, Math.PI, 0);
  
        // Randomly flip card (turn it upside down) with reduced probability (25%)
        if (Math.random() < 0.25) {
          card.rotation.x = Math.PI;
        }
  
        scene.add(card);
        cardMeshes.push(card);
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
  
  const handleCardInteraction = (event) => {
    if (!loadingComplete) return;
  
    const rect = renderer.domElement.getBoundingClientRect();
    let x, y;
    if (event.type === 'touchstart') {
      event.preventDefault(); // Prevent default touch behavior
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
      const isReversed = intersectedCard.rotation.x === Math.PI;
  
      if (event.type === 'click' || event.type === 'touchstart') {
        // Handle click or touch event (e.g., flip the card, show detailed information)
        flipCard(intersectedCard);
      } else if (event.type === 'mousemove') {
        // Show tooltip on hover
        showTooltip(
          intersectedCard.userData.name,
          intersectedCard.userData.description,
          intersectedCard.userData.reversed,
          x,
          y,
          isReversed
        );
      }
    } else {
      hideTooltip();
    }
  };
  
  // Add event listeners
  renderer.domElement.addEventListener('mousemove', handleCardInteraction);
  renderer.domElement.addEventListener('click', handleCardInteraction);
  renderer.domElement.addEventListener('touchstart', handleCardInteraction);
  
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
      { label: 'Four-Card Spread', type: 'four' },
      { label: 'Horseshoe Spread', type: 'horseshoe' }
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