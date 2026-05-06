// ========================
// PUTER.JS POWERED AI ASSISTANT
// ========================
// Uses Puter.js for 400+ free LLM models
// No API keys - Users pay for their own usage

// ========================
// STATE MANAGEMENT
// ========================

let currentChatId = null;
let currentModel = 'gpt-5-nano';
let isLoading = false;
let messageHistory = [];
let conversations = [];

// ========================
// SPEECH RECOGNITION
// ========================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
}

let isListening = false;
const synthesizer = window.speechSynthesis;

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Puter.js AI Assistant...');
    
    // Check if Puter is available
    if (typeof puter === 'undefined') {
        showError('Puter.js failed to load. Please refresh the page.');
        return;
    }
    
    console.log('✓ Puter.js loaded successfully');
    loadTheme();
    setupEventListeners();
    await loadConversations();
    startNewChat();
});

function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    
    // Send message on Enter (Shift+Enter for newlines)
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    });
    
    // Setup voice recognition events
    if (recognition) {
        recognition.onstart = () => {
            isListening = true;
            updateVoiceButton();
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            messageInput.value = (finalTranscript + interimTranscript).trim();
        };
        
        recognition.onend = () => {
            isListening = false;
            updateVoiceButton();
        };
    }
}

// ========================
// CHAT FUNCTIONS (PUTER.JS)
// ========================

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || isLoading) return;
    
    isLoading = true;
    messageInput.disabled = true;
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Add user message to chat
    addMessage('user', message);
    messageHistory.push({ role: 'user', content: message });
    
    // Show loading indicator
    const loadingId = showLoadingIndicator();
    
    try {
        console.log(`🚀 Sending to Puter.js with model: ${currentModel}`);
        
        // Use Puter.js AI chat
        const response = await puter.ai.chat(message, {
            model: currentModel,
            stream: document.getElementById('streamingMode')?.value === 'stream'
        });
        
        // Remove loading indicator
        removeLoadingIndicator(loadingId);
        
        // Handle response
        let aiResponse = response;
        
        // Parse different response formats from Puter.js
        if (typeof response === 'object' && response !== null) {
            if (response.message && typeof response.message === 'string') {
                aiResponse = response.message;
            } else if (response.message?.content) {
                if (Array.isArray(response.message.content)) {
                    aiResponse = response.message.content[0]?.text || response.message.content[0];
                } else {
                    aiResponse = response.message.content;
                }
            } else if (response.text) {
                aiResponse = response.text;
            } else if (response.content) {
                aiResponse = response.content;
            }
        }
        
        aiResponse = String(aiResponse || '').trim();
        
        if (!aiResponse) {
            aiResponse = "I received your message but got an empty response. Please try again.";
        }
        
        console.log('✓ Got response from Puter.js');
        
        // Add AI response
        addMessage('ai', aiResponse);
        messageHistory.push({ role: 'assistant', content: aiResponse });
        
        // Save conversation
        if (!currentChatId) {
            currentChatId = 'chat-' + Date.now();
        }
        saveConversation(currentChatId);
        
        // Read aloud if enabled
        if (document.getElementById('readAloud')?.checked) {
            speakText(aiResponse);
        }
    } catch (error) {
        console.error('❌ Puter.js Error:', error);
        removeLoadingIndicator(loadingId);
        
        const errorMessage = `Error: ${error.message || 'Failed to get response from Puter.js'}`;
        addMessage('ai', errorMessage);
    } finally {
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

function addMessage(role, content) {
    const container = document.getElementById('messagesContainer');
    
    // Hide welcome section if it exists
    const welcome = container.querySelector('.welcome-section');
    if (welcome) welcome.remove();
    
    // Show download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.style.display = 'block';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;
    
    let timestamp = '';
    if (document.getElementById('showTimestamps')?.checked) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestamp = `<div class="message-timestamp">${now}</div>`;
    }
    
    messageDiv.innerHTML = `<p>${escapeHtml(content)}</p>${timestamp}`;
    container.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function showLoadingIndicator() {
    const container = document.getElementById('messagesContainer');
    const loadingDiv = document.createElement('div');
    const id = 'loading-' + Date.now();
    loadingDiv.id = id;
    loadingDiv.className = 'message ai loading';
    loadingDiv.innerHTML = '<p><em>✨ AI is thinking...</em></p>';
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function showError(message) {
    const container = document.getElementById('messagesContainer');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message ai error';
    errorDiv.innerHTML = `<p>⚠️ ${escapeHtml(message)}</p>`;
    container.appendChild(errorDiv);
}

// ========================
// CHAT MANAGEMENT
// ========================

async function startNewChat() {
    currentChatId = null;
    messageHistory = [];
    
    const container = document.getElementById('messagesContainer');
    container.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-content">
                <h2>👋 Welcome to AI Assistant</h2>
                <p>Powered by <strong>Puter.js</strong> - Free access to 400+ LLM models!</p>
                <p style="font-size: 0.9em; color: #999;">No API keys needed. Users pay for their own usage through Puter.js</p>
                <div class="feature-grid">
                    <div class="feature-item">
                        <span class="feature-icon">💬</span>
                        <span>Chat & Answer</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🖼️</span>
                        <span>Image Analysis</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🎤</span>
                        <span>Voice Input</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🌐</span>
                        <span>400+ Models</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">⚡</span>
                        <span>Instant Responses</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💰</span>
                        <span>User-Pays Model</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('messageInput').focus();
}

function saveConversation(id) {
    const conv = {
        id: id,
        title: messageHistory[0]?.content?.substring(0, 30) + '...' || 'New Chat',
        messages: messageHistory,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    let convs = JSON.parse(localStorage.getItem('puter_conversations') || '[]');
    const existing = convs.findIndex(c => c.id === id);
    if (existing >= 0) {
        convs[existing] = conv;
    } else {
        convs.unshift(conv);
    }
    localStorage.setItem('puter_conversations', JSON.stringify(convs.slice(0, 50)));
    
    updateConversationsList();
}

async function loadConversations() {
    try {
        const data = localStorage.getItem('puter_conversations');
        conversations = data ? JSON.parse(data) : [];
        updateConversationsList();
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function updateConversationsList() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    conversations.forEach(conv => {
        const item = document.createElement('button');
        item.className = `conversation-item ${conv.id === currentChatId ? 'active' : ''}`;
        item.textContent = conv.title || 'Untitled Chat';
        item.onclick = () => loadConversation(conv.id);
        item.oncontextmenu = (e) => {
            e.preventDefault();
            deleteConversation(conv.id);
        };
        list.appendChild(item);
    });
}

function loadConversation(chatId) {
    const conv = conversations.find(c => c.id === chatId);
    if (!conv) return;
    
    currentChatId = chatId;
    messageHistory = conv.messages || [];
    
    // Clear and reload messages
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    
    messageHistory.forEach(msg => {
        addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
    });
    
    updateConversationsList();
}

function deleteConversation(chatId) {
    if (!confirm('Delete this conversation?')) return;
    
    conversations = conversations.filter(c => c.id !== chatId);
    localStorage.setItem('puter_conversations', JSON.stringify(conversations));
    
    if (currentChatId === chatId) {
        startNewChat();
    }
    
    updateConversationsList();
}

function downloadChat() {
    if (messageHistory.length === 0) {
        alert('No messages to download');
        return;
    }
    
    let content = 'Chat Export - ' + new Date().toLocaleString() + '\n\n';
    messageHistory.forEach(msg => {
        content += `${msg.role.toUpperCase()}:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-' + currentChatId + '.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// ========================
// IMAGE HANDLING
// ========================

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // Show image in chat
        const container = document.getElementById('messagesContainer');
        const imgDiv = document.createElement('div');
        imgDiv.className = 'message user';
        imgDiv.innerHTML = `<img src="${imageData}" style="max-width: 200px; border-radius: 8px;">`;
        container.appendChild(imgDiv);
        container.scrollTop = container.scrollHeight;
        
        // Analyze image with Puter.js
        const loadingId = showLoadingIndicator();
        
        try {
            console.log('🖼️ Analyzing image with Puter.js...');
            
            const response = await puter.ai.chat(
                'Analyze this image in detail. What do you see?',
                imageData,
                { model: currentModel }
            );
            
            removeLoadingIndicator(loadingId);
            
            let analysis = response;
            if (typeof response === 'object' && response !== null) {
                if (response.message) analysis = response.message;
                if (response.content) analysis = response.content;
            }
            
            addMessage('ai', `📊 Image Analysis:\n${String(analysis || '')}`);
            messageHistory.push({ role: 'assistant', content: `Image Analysis: ${analysis}` });
            
            if (document.getElementById('readAloud')?.checked) {
                speakText(String(analysis));
            }
        } catch (error) {
            removeLoadingIndicator(loadingId);
            addMessage('ai', `❌ Error analyzing image: ${error.message}`);
        }
    };
    reader.readAsDataURL(file);
}

// ========================
// VOICE FUNCTIONS
// ========================

function toggleVoiceInput() {
    if (!recognition) {
        alert('Speech recognition not supported in your browser');
        return;
    }
    
    if (!isListening) {
        recognition.start();
    } else {
        recognition.stop();
    }
}

function updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    if (isListening) {
        btn.classList.add('active');
        btn.textContent = '⏹️';
    } else {
        btn.classList.remove('active');
        btn.textContent = '🎤';
    }
}

function speakText(text) {
    if (!synthesizer.speaking) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        synthesizer.speak(utterance);
    }
}

// ========================
// UI CONTROLS
// ========================

function switchModel() {
    const select = document.getElementById('modelSelect');
    currentModel = select.value;
    console.log('🔄 Switched to model:', currentModel);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

function setTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', prefersDark);
    } else {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('hidden');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ========================
// UTILITY FUNCTIONS
// ========================

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

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    
    if (!modal.contains(e.target) && !e.target.closest('[onclick*="toggleSettings"]')) {
        modal.classList.add('hidden');
    }
});