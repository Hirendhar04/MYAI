#!/usr/bin/env python3
"""
Project setup script - creates all necessary directories and files
"""
import os

# HTML template content
HTML_CONTENT = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    <script src="https://js.puter.com/v2/"></script>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <h1>🤖 AI Assistant</h1>
                <div class="header-controls">
                    <select id="modelSelect" class="model-select">
                        <option value="gpt-5-nano">GPT-5 Nano</option>
                        <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                        <option value="deepseek/deepseek-r1">DeepSeek R1</option>
                        <option value="gemini-2.0-flash">Gemini 2.0</option>
                    </select>
                    <button id="themeToggle" class="theme-toggle" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
                        🌙
                    </button>
                </div>
            </div>
        </header>

        <main class="chat-container">
            <div class="chat-box" id="chatBox">
                <div class="message ai-message">
                    <p>Hello! How can I help you today?</p>
                </div>
            </div>

            <div class="input-section">
                <div class="input-group">
                    <input 
                        type="text" 
                        id="messageInput" 
                        placeholder="Type your message or use voice..." 
                        autocomplete="off"
                    >
                    <button id="sendBtn" onclick="sendMessage()" class="btn-send" title="Send message">
                        📤 Send
                    </button>
                    <button id="voiceBtn" onclick="toggleVoiceConversation()" class="btn-icon" title="Start voice conversation">
                        🎤
                    </button>
                    <button id="imageBtn" onclick="document.getElementById('imageInput').click()" class="btn-icon" title="Upload image">
                        📸
                    </button>
                </div>
                <input type="file" id="imageInput" accept="image/*" onchange="handleImageSelect(event)" style="display: none;">
            </div>
        </main>
    </div>

    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
</body>
</html>'''

# CSS content
CSS_CONTENT = '''* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    width: 100%;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    transition: background 0.3s ease;
}

/* Dark Mode */
body.dark-mode {
    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
}

.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
}

header {
    background: rgba(255, 255, 255, 0.95);
    padding: 15px 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid #e9ecef;
}

body.dark-mode header {
    background: #2a2a3e;
    border-bottom-color: #3a3a4e;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    font-size: 1.8em;
    color: #667eea;
    margin: 0;
}

body.dark-mode header h1 {
    color: #8b9eff;
}

.header-controls {
    display: flex;
    gap: 15px;
    align-items: center;
}

.model-select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    font-size: 0.95em;
    transition: all 0.3s;
}

body.dark-mode .model-select {
    background: #3a3a4e;
    color: #e0e0e0;
    border-color: #4a4a5e;
}

.model-select:hover, .model-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.theme-toggle {
    width: 45px;
    height: 45px;
    border: 1px solid #ddd;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    font-size: 1.2em;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

body.dark-mode .theme-toggle {
    background: #3a3a4e;
    border-color: #4a4a5e;
}

.theme-toggle:hover {
    transform: rotate(20deg);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 20px;
    overflow: hidden;
}

.chat-box {
    flex: 1;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
}

body.dark-mode .chat-box {
    background: #2a2a3e;
    border-color: #3a3a4e;
}

.message {
    margin-bottom: 15px;
    padding: 12px 16px;
    border-radius: 10px;
    word-wrap: break-word;
    max-width: 85%;
    animation: messageSlide 0.3s ease-out;
    line-height: 1.5;
}

.user-message {
    background: #667eea;
    color: white;
    margin-left: auto;
    text-align: right;
    border-radius: 18px 18px 4px 18px;
}

.ai-message {
    background: #f0f0f7;
    color: #333;
    border-radius: 18px 18px 18px 4px;
}

body.dark-mode .ai-message {
    background: #3a3a4e;
    color: #e0e0e0;
}

.input-section {
    background: white;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
}

body.dark-mode .input-section {
    background: #2a2a3e;
    border-color: #3a3a4e;
}

.input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.input-group input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    transition: all 0.3s;
    background: white;
    color: #333;
}

body.dark-mode .input-group input {
    background: #3a3a4e;
    color: #e0e0e0;
    border-color: #4a4a5e;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-send {
    padding: 12px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95em;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
}

.btn-send:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
    width: 45px;
    height: 45px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2em;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

body.dark-mode .btn-icon {
    background: #3a3a4e;
    border-color: #4a4a5e;
    color: #e0e0e0;
}

.btn-icon:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: scale(1.1);
}

body.dark-mode .btn-icon:hover {
    background: #8b9eff;
    border-color: #8b9eff;
}

.btn-icon.active {
    background: #ff6b6b;
    border-color: #ff6b6b;
    color: white;
}

/* Scrollbar Styling */
.chat-box::-webkit-scrollbar {
    width: 8px;
}

.chat-box::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

body.dark-mode .chat-box::-webkit-scrollbar-track {
    background: #3a3a4e;
}

.chat-box::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 10px;
}

.chat-box::-webkit-scrollbar-thumb:hover {
    background: #5568d3;
}

/* Animations */
@keyframes messageSlide {
    from {
        transform: translateY(10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 768px) {
    header h1 {
        font-size: 1.3em;
    }

    .header-controls {
        gap: 10px;
    }

    .model-select {
        font-size: 0.85em;
        padding: 8px 10px;
    }

    .chat-container {
        padding: 10px;
    }

    .chat-box {
        margin-bottom: 10px;
        padding: 15px;
    }

    .message {
        max-width: 95%;
    }

    .input-group {
        gap: 8px;
    }

    .btn-send {
        padding: 10px 15px;
        font-size: 0.9em;
    }

    .btn-icon {
        width: 40px;
        height: 40px;
    }
}'''

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

let isListening = false;
let silenceTimeout;
let currentTranscript = '';

// Chat functionality with Puter.js LLM
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatBox = document.getElementById('chatBox');
    const model = document.getElementById('modelSelect').value;
    
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
        // Use Puter.js to get AI response
        const response = await puter.ai.chat(message, { 
            model: model
        });
        
        // Remove loading indicator
        chatBox.removeChild(loadingDiv);
        
        // Add AI response to chat
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `<p>${escapeHtml(response)}</p>`;
        chatBox.appendChild(aiMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Speak AI response
        speakResponse(response);
    } catch (error) {
        console.error('Error:', error);
        chatBox.removeChild(loadingDiv);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        errorDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        chatBox.appendChild(errorDiv);
    }
}

// Voice to Text and Auto-Reply
recognition.onstart = () => {
    isListening = true;
    document.getElementById('startVoiceBtn').textContent = '🎤 Listening...';
    document.getElementById('startVoiceBtn').style.background = '#ff6b6b';
    currentTranscript = '';
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
    document.getElementById('startVoiceBtn').textContent = '🎤 Start Conversation';
    document.getElementById('startVoiceBtn').style.background = '#667eea';
    
    // Auto-send the message
    if (currentTranscript.trim()) {
        setTimeout(() => sendMessage(), 300);
    }
    currentTranscript = '';
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    document.getElementById('voiceResult').innerHTML = `<p>Error: ${event.error}</p>`;
    document.getElementById('voiceResult').classList.add('active');
};

// Start voice conversation
function startVoiceConversation() {
    if (!isListening) {
        recognition.start();
    }
}

// Stop voice conversation
function stopVoiceConversation() {
    if (isListening) {
        recognition.stop();
    }
}

// Text-to-Speech for AI responses
function speakResponse(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}
// Image functionality with Puter.js AI
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageData = e.target.result;
        const model = document.getElementById('modelSelect').value;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${imageData}" alt="preview">`;
        preview.classList.add('active');
        
        // Show loading
        const resultBox = document.getElementById('imageResult');
        resultBox.innerHTML = `<p><em>Analyzing image...</em></p>`;
        resultBox.classList.add('active');
        
        try {
            // Use Puter.js for image analysis
            const response = await puter.ai.chat(
                "Describe this image in detail. What do you see?",
                imageData,
                { model: model }
            );
            
            // Show result
            resultBox.innerHTML = `<p><strong>Analysis:</strong> ${escapeHtml(response)}</p>`;
        } catch (error) {
            console.error('Error:', error);
            resultBox.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    };
    reader.readAsDataURL(file);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Allow Enter key for sending messages
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});'''

def create_project():
    # Create directories
    dirs = ['templates', 'static', 'static/css', 'static/js']
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)
        print(f"✓ Created directory: {dir_path}")
    
    # Create HTML
    with open('templates/index.html', 'w', encoding='utf-8') as f:
        f.write(HTML_CONTENT)
    print("✓ Created templates/index.html")
    
    # Create CSS
    with open('static/css/style.css', 'w', encoding='utf-8') as f:
        f.write(CSS_CONTENT)
    print("✓ Created static/css/style.css")
    
    # Create JavaScript
    with open('static/js/script.js', 'w', encoding='utf-8') as f:
        f.write(JS_CONTENT)
    print("✓ Created static/js/script.js")
    
    print("\n✅ Project setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the app: python app.py")
    print("3. Open http://localhost:5000 in your browser")

if __name__ == '__main__':
    create_project()
