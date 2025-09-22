// Game state management - central hub for all data
const gameState = {
    player: {
        class: '',
        level: 1,
        health: 100,
        maxHealth: 100,
        resource: 100,
        maxResource: 100,
        resourceType: '',
        inventory: [],
        position: { x: 0, y: 0 },
        experience: 0
    },
    map: {},
    currentRoom: null,
    isListening: false,
    gameStarted: false,
    needsClassSelection: true,
    isPaused: false,
    speechQueue: []
};

// Class definitions
const classes = {
    warrior: {
        name: 'Warrior',
        resourceType: 'Stamina',
        baseHealth: 120,
        baseResource: 80,
        startingItems: ['Iron Sword', 'Health Potion', 'Stamina Potion']
    },
    mage: {
        name: 'Mage',
        resourceType: 'Mana',
        baseHealth: 80,
        baseResource: 120,
        startingItems: ['Wooden Staff', 'Health Potion', 'Mana Crystal']
    },
    rogue: {
        name: 'Rogue',
        resourceType: 'Energy',
        baseHealth: 100,
        baseResource: 100,
        startingItems: ['Steel Dagger', 'Health Potion', 'Shadow Crystal']
    }
};

// Make available globally for other modules
window.gameState = gameState;
window.classes = classes;

// Class selection function
function selectClass(className) {
    const classData = classes[className];
    gameState.player.class = className;
    gameState.player.health = classData.baseHealth;
    gameState.player.maxHealth = classData.baseHealth;
    gameState.player.resource = classData.baseResource;
    gameState.player.maxResource = classData.baseResource;
    gameState.player.resourceType = classData.resourceType;
    gameState.player.inventory = [...classData.startingItems];
    
    gameState.gameStarted = true;
    gameState.needsClassSelection = false;
    gameState.map = generateMap();
    
    speak(`Welcome, ${classData.name}! Your adventure begins now. You have ${classData.baseHealth} health and ${classData.baseResource} ${classData.resourceType}. Your starting equipment includes ${classData.startingItems.join(', ')}. You stand at the entrance of an ancient dungeon.`);
    
    setTimeout(() => {
        enterRoom(0, 0);
    }, 8000);
}

// Utility function for dice rolls
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

window.rollDice = rollDice;
window.selectClass = selectClass;
