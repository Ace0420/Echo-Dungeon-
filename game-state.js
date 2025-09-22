// Command processing - natural language parsing
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
    
    // All your existing command logic here...
    // Status, movement, combat, inventory, etc.
    
    // Default response
    speak("I don't understand that command. Say help to hear what you can do.");
}

// Export
window.processCommand = processCommand;
