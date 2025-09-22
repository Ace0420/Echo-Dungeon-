// Voice engine - handles all speech input/output
let recognition = null;

function speak(text, interrupt = true) {
    if (gameState.isPaused) {
        gameState.speechQueue.push({ text, interrupt });
        return;
    }
    
    try {
        if (interrupt) {
            speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onerror = () => console.warn('Speech synthesis failed');
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech error:', error);
    }
}

function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        speak("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        gameState.isListening = true;
        document.getElementById('micButton').classList.add('listening');
        document.getElementById('micText').textContent = 'LISTENING...';
    };
    
    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        processCommand(command);
    };
    
    recognition.onerror = function(event) {
        speak("I didn't catch that. Please try again.");
        stopListening();
    };
    
    recognition.onend = function() {
        stopListening();
    };
    
    recognition.start();
}

function stopListening() {
    gameState.isListening = false;
    document.getElementById('micButton').classList.remove('listening');
    document.getElementById('micText').textContent = 'SPEAK';
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
}

function toggleListening() {
    if (!gameState.isListening) {
        startListening();
    } else {
        stopListening();
    }
}

// Process queued speech when unpaused
function processSpeechQueue() {
    if (gameState.speechQueue.length > 0 && !gameState.isPaused) {
        const next = gameState.speechQueue.shift();
        speak(next.text, next.interrupt);
    }
}

// Pause/resume speech (for future use)
function pauseSpeech() {
    gameState.isPaused = true;
}

function resumeSpeech() {
    gameState.isPaused = false;
    processSpeechQueue();
}

// Make functions globally available
window.speak = speak;
window.toggleListening = toggleListening;
window.pauseSpeech = pauseSpeech;
window.resumeSpeech = resumeSpeech;
