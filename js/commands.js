// Command processing - natural language parsing and execution
function processCommand(command) {
    console.log('Processing command:', command);
    
    // Class selection
    if (gameState.needsClassSelection) {
        if (command.includes('warrior')) {
            selectClass('warrior');
            return;
        } else if (command.includes('mage')) {
            selectClass('mage');
            return;
        } else if (command.includes('rogue')) {
            selectClass('rogue');
            return;
        } else {
            speak("Please choose your class. Say warrior, mage, or rogue.");
            return;
        }
    }
    
    if (!gameState.gameStarted) return;
    
    // Status commands
    if (command.includes('status') || command.includes('health') || command.includes('stats')) {
        speak(`You are a level ${gameState.player.level} ${classes[gameState.player.class].name}. You have ${gameState.player.health} out of ${gameState.player.maxHealth} health, and ${gameState.player.resource} out of ${gameState.player.maxResource} ${gameState.player.resourceType}.`);
        return;
    }
    
    // Movement commands
    if (command.includes('go ') || command.includes('move ') || command.includes('walk ') || 
        command.includes('north') || command.includes('south') || command.includes('east') || command.includes('west')) {
        const directions = ['north', 'south', 'east', 'west'];
        const direction = directions.find(dir => command.includes(dir));
        if (direction) {
            movePlayer(direction);
            return;
        }
    }
    
    // Combat commands
    if (command.includes('attack') || command.includes('fight') || command.includes('hit') || command.includes('battle')) {
        if (gameState.currentRoom && gameState.currentRoom.enemies) {
            combat();
        } else {
            speak("There's nothing to attack here. This room is peaceful.");
        }
        return;
    }
    
    // Inventory commands
    if (command.includes('inventory') || command.includes('items') || command.includes('gear') || command.includes('bag')) {
        listInventory();
        return;
    }
    
    // Use item commands
    if (command.includes('use ') || command.includes('drink ') || command.includes('consume ')) {
        const items = gameState.player.inventory;
        const item = items.find(i => command.includes(i.toLowerCase().replace(' ', '')));
        if (item) {
            useItem(item);
        } else {
            speak("I don't understand which item you want to use. Say inventory to hear your items.");
        }
        return;
    }
    
    // Search/explore commands
    if (command.includes('search') || command.includes('explore') || command.includes('look') || command.includes('examine')) {
        exploreRoom();
        return;
    }
    
    // Location/exits commands
    if (command.includes('where') || command.includes('exits') || command.includes('directions')) {
        describeLocation();
        return;
    }
    
    // Help command
    if (command.includes('help') || command.includes('commands') || command.includes('what can i')) {
        speak("You can say: go north, south, east, or west to move. Say attack to fight enemies. Say search to explore the room. Say inventory to hear your items. Say use followed by an item name to use it. Say status to hear your health. Say help for this message.");
        return;
    }
    
    // Default response
    speak("I don't understand that command. Say help to hear what you can do.");
}

// Make globally available
window.processCommand = processCommand;
