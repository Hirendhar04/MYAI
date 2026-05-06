// Dark Mode Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('themeToggle');
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Load saved theme
function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButton();
    }
}

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

let isListening = false;
let silenceTimeout;
let currentTranscript = '';

// Chat functionality with Puter.js AI
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatBox = document.getElementById('chatBox');
    const model = document.getElementById('modelSelect').value;
    
    // Show chat box and hide action buttons
    chatBox.classList.add('active');
    document.querySelector('.action-buttons').style.display = 'none';
    document.querySelector('.title-section h2').textContent = 'Chat';
    
    // Add user message to chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatBox.appendChild(userMessageDiv);
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.innerHTML = `<p><em>AI is thinking...</em></p>`;
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Check if Puter is available
        if (typeof puter === 'undefined' || typeof puter.ai === 'undefined') {
            throw new Error('Puter.js not loaded. Trying to reload...');
        }
        
        console.log('Sending to Puter AI with model:', model);
        
        // Use Puter.js to get AI response
        const response = await puter.ai.chat(message, { 
            model: model,
            stream: false
        });
        
        console.log('Puter response:', response);
        
        let aiResponse = response;
        
        // Handle various response formats
        if (typeof response === 'object' && response !== null) {
            // Try different property names
            if (response.message && typeof response.message === 'string') {
                aiResponse = response.message;
            } else if (response.message && typeof response.message === 'object') {
                if (response.message.content && Array.isArray(response.message.content)) {
                    aiResponse = response.message.content[0]?.text || response.message.content[0];
                } else if (response.message.content && typeof response.message.content === 'string') {
                    aiResponse = response.message.content;
                } else if (response.message.text) {
                    aiResponse = response.message.text;
                }
            } else if (response.content) {
                if (Array.isArray(response.content)) {
                    aiResponse = response.content[0]?.text || response.content[0];
                } else {
                    aiResponse = response.content;
                }
            } else if (response.text) {
                aiResponse = response.text;
            } else if (response.choices && Array.isArray(response.choices)) {
                const choice = response.choices[0];
                if (choice.message?.content) {
                    aiResponse = choice.message.content;
                } else if (choice.text) {
                    aiResponse = choice.text;
                }
            } else {
                // Last resort: convert to string
                aiResponse = JSON.stringify(response);
            }
        }
        
        aiResponse = String(aiResponse || '').trim();
        
        if (!aiResponse) {
            aiResponse = "I received your message but had trouble generating a response. Please try again.";
        }
        
        // Remove loading indicator
        if (loadingDiv.parentNode) {
            chatBox.removeChild(loadingDiv);
        }
        
        // Add AI response to chat
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `<p>${escapeHtml(aiResponse)}</p>`;
        chatBox.appendChild(aiMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Speak AI response only
        speakResponse(aiResponse);
    } catch (error) {
        console.error('Puter AI Error:', error);
        if (loadingDiv.parentNode) {
            chatBox.removeChild(loadingDiv);
        }
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        errorDiv.innerHTML = `<p>Error: ${escapeHtml(error.message)}. Using fallback response...</p>`;
        chatBox.appendChild(errorDiv);
        
        // Fallback: use Flask backend
        try {
            const fallbackResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await fallbackResponse.json();
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'message ai-message';
            fallbackDiv.innerHTML = `<p>${escapeHtml(data.response)}</p>`;
            chatBox.appendChild(fallbackDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
            speakResponse(data.response);
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
        }
    }
}

// Voice to Text and Auto-Reply
recognition.onstart = () => {
    isListening = true;
    document.getElementById('voiceBtn').classList.add('active');
};

recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
            currentTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }
    
    // Show live transcription
    const messageInput = document.getElementById('messageInput');
    messageInput.value = (currentTranscript + interimTranscript).trim();
    
    // Reset silence timer
    clearTimeout(silenceTimeout);
    silenceTimeout = setTimeout(() => {
        if (currentTranscript.trim()) {
            recognition.stop();
        }
    }, 1500);
};

recognition.onend = () => {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('active');
    
    // Auto-send the message
    if (currentTranscript.trim()) {
        setTimeout(() => sendMessage(), 300);
    }
    currentTranscript = '';
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('active');
};

// Toggle voice conversation
function toggleVoiceConversation() {
    if (!isListening) {
        recognition.start();
    } else {
        recognition.stop();
    }
}

// Image functionality with Puter.js AI
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageData = e.target.result;
        const model = document.getElementById('modelSelect').value;
        
        const chatBox = document.getElementById('chatBox');
        
        // Show chat and hide action buttons
        chatBox.classList.add('active');
        document.querySelector('.action-buttons').style.display = 'none';
        document.querySelector('.title-section h2').textContent = 'Chat';
        
        // Show image preview in chat
        const imgPreviewDiv = document.createElement('div');
        imgPreviewDiv.className = 'message user-message';
        imgPreviewDiv.innerHTML = `<img src="${imageData}" style="max-width: 200px; border-radius: 8px; margin-bottom: 5px;"><p>Analyzing image...</p>`;
        chatBox.appendChild(imgPreviewDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        try {
            // Check if Puter is available
            if (typeof puter === 'undefined' || typeof puter.ai === 'undefined') {
                throw new Error('Puter.js not loaded');
            }
            
            // Use Puter.js for image analysis
            const response = await puter.ai.chat(
                "Describe this image in detail. What do you see?",
                imageData,
                { model: model }
            );
            
            let analysisResponse = response;
            if (typeof response === 'object' && response !== null) {
                if (response.message) analysisResponse = response.message;
                if (response.content) analysisResponse = response.content;
            }
            analysisResponse = String(analysisResponse || '').trim();
            
            // Update message
            imgPreviewDiv.innerHTML = `<img src="${imageData}" style="max-width: 200px; border-radius: 8px; margin-bottom: 5px;">`;
            
            // Add AI response
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message ai-message';
            aiMessageDiv.innerHTML = `<p><strong>Image Analysis:</strong> ${escapeHtml(analysisResponse)}</p>`;
            chatBox.appendChild(aiMessageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Speak response
            speakResponse(analysisResponse);
        } catch (error) {
            console.error('Image analysis error:', error);
            imgPreviewDiv.innerHTML = `<img src="${imageData}" style="max-width: 200px; border-radius: 8px; margin-bottom: 5px;">`;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message';
            errorDiv.innerHTML = `<p>Error analyzing image: ${escapeHtml(error.message)}</p>`;
            chatBox.appendChild(errorDiv);
        }
    };
    reader.readAsDataURL(file);
}

// Text-to-Speech for AI responses
function speakResponse(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text || typeof text !== 'string') {
        text = String(text || '');
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Action button handler
function selectAction(action) {
    switch(action) {
        case 'image':
            document.getElementById('imageInput').click();
            break;
        case 'voice':
            toggleVoiceConversation();
            break;
        case 'write':
            document.getElementById('messageInput').focus();
            document.getElementById('messageInput').placeholder = 'Start typing your message...';
            break;
    }
}