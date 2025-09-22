// Dungeon core - game logic (voice agnostic)
function generateMap() {
    const map = {};
    const size = 10;
    
    for (let x = -size; x <= size; x++) {
        for (let y = -size; y <= size; y++) {
            const roomType = Math.random() < 0.3 ? 'combat' : 
                           Math.random() < 0.6 ? 'exploration' : 'treasure';
            
            map[`${x},${y}`] = {
                type: roomType,
                visited: false,
                description: generateRoomDescription(roomType),
                enemies: roomType === 'combat' ? generateEnemy() : null,
                treasure: roomType === 'treasure' ? generateTreasure() : null,
                exits: generateExits(x, y)
            };
        }
    }
    
    // Starting room
    map['0,0'] = {
        type: 'start',
        visited: true,
        description: 'The entrance chamber of the dungeon. Ancient stone walls surround you, and torch light flickers in the distance.',
        enemies: null,
        treasure: null,
        exits: ['north', 'east', 'west']
    };
    
    return map;
}

function generateRoomDescription(type) {
    const descriptions = {
        combat: [
            'A dark chamber echoes with the growls of lurking creatures. The air is thick with danger.',
            'You hear the scraping of claws against stone. Something hostile lurks in the shadows.',
            'The room grows cold as hostile eyes watch you from the darkness.',
            'Bones crunch under your feet. This chamber reeks of recent battle.'
        ],
        exploration: [
            'Ancient murals cover the walls of this mysterious chamber. Dust motes dance in shafts of light.',
            'Strange symbols are carved deep into the weathered stone floor.',
            'This forgotten room holds the whispers of ages past.',
            'Cobwebs brush your face as you enter this long-abandoned chamber.'
        ],
        treasure: [
            'Something glints in the far corner of this forgotten vault.',
            'You sense valuable items hidden within this chamber.',
            'The sound of your footsteps echoes off treasure-laden walls.',
            'This room has the feeling of hidden riches waiting to be discovered.'
        ]
    };
    return descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
}

function generateEnemy() {
    const enemies = [
        { name: 'Goblin', health: 30, attack: 15, description: 'A small but vicious creature with yellowed fangs' },
        { name: 'Skeleton Warrior', health: 45, attack: 20, description: 'Bones rattle as this undead fighter readies its weapon' },
        { name: 'Cave Spider', health: 25, attack: 12, description: 'A giant spider that clicks menacingly in the shadows' },
        { name: 'Orc Brute', health: 60, attack: 25, description: 'A massive, brutish creature wielding a crude club' },
        { name: 'Shadow Beast', health: 40, attack: 18, description: 'A creature of pure darkness that seems to shift and waver' }
    ];
    return { ...enemies[Math.floor(Math.random() * enemies.length)] };
}

function generateTreasure() {
    const treasures = [
        'Health Potion', 'Gold Coins', 'Magic Ring', 
        'Stamina Potion', 'Mana Crystal', 'Shadow Crystal',
        'Ancient Key', 'Healing Herb', 'Silver Pendant',
        'Enchanted Gem', 'Mysterious Scroll', 'Golden Chalice'
    ];
    return treasures[Math.floor(Math.random() * treasures.length)];
}

function generateExits(x, y) {
    const exits = [];
    if (Math.random() > 0.2) exits.push('north');
    if (Math.random() > 0.2) exits.push('south');
    if (Math.random() > 0.2) exits.push('east');
    if (Math.random() > 0.2) exits.push('west');
    return exits.length > 0 ? exits : ['north']; // Ensure at least one exit
}

// Movement system
function movePlayer(direction) {
    const currentPos = gameState.player.position;
    const newPos = { ...currentPos };
    
    switch (direction) {
        case 'north': newPos.y += 1; break;
        case 'south': newPos.y -= 1; break;
        case 'east': newPos.x += 1; break;
        case 'west': newPos.x -= 1; break;
    }
    
    const roomKey = `${newPos.x},${newPos.y}`;
    const currentRoomKey = `${currentPos.x},${currentPos.y}`;
    const currentRoom = gameState.map[currentRoomKey];
    
    if (!currentRoom.exits.includes(direction)) {
        speak("You can't go that way. There's a solid stone wall blocking your path.");
        return;
    }
    
    if (gameState.map[roomKey]) {
        gameState.player.position = newPos;
        speak(`You move ${direction}.`);
        setTimeout(() => {
            enterRoom(newPos.x, newPos.y);
        }, 1500);
    } else {
        speak("You can't go that way. The path is blocked.");
    }
}

function enterRoom(x, y) {
    const roomKey = `${x},${y}`;
    const room = gameState.map[roomKey];
    gameState.currentRoom = room;
    
    if (!room.visited) {
        room.visited = true;
        speak(room.description);
        
        if (room.enemies) {
            setTimeout(() => {
                speak(`A ${room.enemies.name} blocks your path! ${room.enemies.description}. It looks ready to fight!`);
            }, 3000);
        } else if (room.treasure) {
            setTimeout(() => {
                speak("You sense something valuable in this room.");
            }, 3000);
        }
    } else {
        speak("You return to a familiar room. " + room.description);
        if (room.enemies) {
            setTimeout(() => {
                speak(`The ${room.enemies.name} is still here, watching you menacingly.`);
            }, 2500);
        }
    }
}

function describeLocation() {
    const room = gameState.currentRoom;
    const exits = room.exits.join(', ');
    let description = `You can go ${exits}. `;
    
    if (room.enemies) {
        description += `A ${room.enemies.name} blocks your way.`;
    } else if (room.treasure) {
        description += "You sense treasure nearby.";
    } else {
        description += "The room seems empty.";
    }
    
    speak(description);
}

// Combat system
function combat() {
    const enemy = gameState.currentRoom.enemies;
    if (!enemy) return;
    
    const playerAttack = rollDice(20) + (gameState.player.class === 'warrior' ? 6 : 4);
    const enemyAttack = rollDice(20) + 2;
    
    if (playerAttack > enemyAttack) {
        let damage = rollDice(gameState.player.class === 'warrior' ? 12 : 
                            gameState.player.class === 'mage' ? 10 : 8) + 3;
        enemy.health -= damage;
        
        if (enemy.health <= 0) {
            speak(`You strike the final blow! The ${enemy.name} collapses and disappears into shadow. Victory is yours!`);
            gameState.currentRoom.enemies = null;
            
            // Reward
            gameState.player.experience += 25;
            setTimeout(() => {
                speak("You gain experience from your victory.");
            }, 2000);
            
            if (Math.random() < 0.7) {
                const reward = generateTreasure();
                gameState.player.inventory.push(reward);
                setTimeout(() => {
                    speak(`Searching the area, you discover a ${reward}! It has been added to your inventory.`);
                }, 4000);
            }
        } else {
            speak(`Your attack hits! You deal ${damage} damage to the ${enemy.name}. The creature staggers but remains standing, with ${enemy.health} health remaining.`);
        }
    } else {
        const damage = rollDice(8) + 2;
        gameState.player.health -= damage;
        speak(`The ${enemy.name} strikes you for ${damage} damage! You grunt in pain. Your health is now ${gameState.player.health}.`);
        
        if (gameState.player.health <= 0) {
            speak("You collapse from your wounds. The dungeon claims another adventurer... But wait! Your spirit is strong. You awaken with 1 health at the dungeon entrance. Your adventure continues.");
            gameState.player.health = 1;
            gameState.player.position = { x: 0, y: 0 };
            setTimeout(() => {
                enterRoom(0, 0);
            }, 5000);
        }
    }
}

// Exploration system
function exploreRoom() {
    const room = gameState.currentRoom;
    
    if (room.enemies) {
        speak(`You cautiously examine the room. A ${room.enemies.name} watches your every move, ready to attack if you get too close.`);
        return;
    }
    
    if (room.treasure) {
        speak(`Your careful search pays off! You discover a ${room.treasure}! It has been added to your inventory.`);
        gameState.player.inventory.push(room.treasure);
        room.treasure = null;
        return;
    }
    
    const searchResults = [
        "You search the room thoroughly, running your hands along the cold stone walls. Nothing useful here.",
        "Your exploration reveals only dust, cobwebs, and the whispers of ancient history.",
        "You investigate every corner carefully. The room holds memories, but no treasures.",
        "Despite your careful search, you find nothing of immediate value in this chamber."
    ];
    
    speak(searchResults[Math.floor(Math.random() * searchResults.length)]);
    
    // Random chance for hidden discovery
    if (Math.random() < 0.15) {
        setTimeout(() => {
            const findings = ['a few gold coins', 'a healing herb', 'ancient knowledge'];
            const finding = findings[Math.floor(Math.random() * findings.length)];
            speak(`Wait! Your thorough search reveals ${finding} hidden in the shadows.`);
            if (finding !== 'ancient knowledge') {
                gameState.player.inventory.push(finding);
            }
        }, 3000);
    }
}

// Item usage system
function useItem(itemName) {
    const index = gameState.player.inventory.indexOf(itemName);
    if (index === -1) {
        speak("You don't have that item in your inventory.");
        return;
    }
    
    gameState.player.inventory.splice(index, 1);
    
    switch (itemName.toLowerCase()) {
        case 'health potion':
            const healing = 30 + rollDice(10);
            gameState.player.health = Math.min(gameState.player.health + healing, gameState.player.maxHealth);
            speak(`You drink the health potion. Warmth spreads through your body as you heal ${healing} points. Your health is now ${gameState.player.health}.`);
            break;
        
        case 'stamina potion':
            if (gameState.player.class === 'warrior') {
                gameState.player.resource = gameState.player.maxResource;
                speak("You drink the stamina potion. Energy surges through your muscles! Your stamina is fully restored.");
            } else {
                speak("The stamina potion tastes strange to you. It provides some energy, but doesn't feel quite right for your class.");
            }
            break;
        
        case 'mana crystal':
            if (gameState.player.class === 'mage') {
                gameState.player.resource = gameState.player.maxResource;
                speak("You hold the mana crystal close. Magical energy flows into you, completely restoring your mana!");
            } else {
                speak("The crystal hums with magical energy, but you can't properly attune to its power.");
            }
            break;
        
        case 'shadow crystal':
            if (gameState.player.class === 'rogue') {
                gameState.player.resource = gameState.player.maxResource;
                speak("You absorb the shadow crystal's dark energy. You feel nimble and energized! Your energy is fully restored.");
            } else {
                speak("The shadow crystal feels cold and alien in your hands. Its dark energy doesn't mesh well with your abilities.");
            }
            break;
        
        case 'healing herb':
            const herbHealing = 15;
            gameState.player.health = Math.min(gameState.player.health + herbHealing, gameState.player.maxHealth);
            speak(`You chew the bitter healing herb. It restores ${herbHealing} health points.`);
            break;
        
        default:
            speak(`You examine the ${itemName} carefully, but you're not sure how to use it effectively right now.`);
    }
}

// Inventory management
function listInventory() {
    if (gameState.player.inventory.length === 0) {
        speak("Your inventory is empty. You carry only the clothes on your back.");
        return;
    }
    
    speak(`You are carrying: ${gameState.player.inventory.join(', ')}.`);
}

// Make all functions globally available
window.generateMap = generateMap;
window.movePlayer = movePlayer;
window.combat = combat;
window.exploreRoom = exploreRoom;
window.useItem = useItem;
window.listInventory = listInventory;
window.describeLocation = describeLocation;
window.enterRoom = enterRoom;
