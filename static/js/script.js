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
let latestFinalTranscript = '';
let latestInterimTranscript = '';
let voiceConversationMode = false;
let isSpeaking = false;


// ========================
// SPEECH RECOGNITION
// ========================


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
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
            latestFinalTranscript = '';
            latestInterimTranscript = '';
            updateVoiceButton();
        };
       
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
           
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
               
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    latestFinalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                    latestInterimTranscript = interimTranscript;
                }
            }
           
            messageInput.value = (finalTranscript + interimTranscript).trim();
        };
       
        recognition.onend = () => {
            isListening = false;
            updateVoiceButton();


            if (!voiceConversationMode) {
                return;
            }


            const voiceMessage = (latestFinalTranscript + ' ' + latestInterimTranscript).trim() || messageInput.value.trim();
            if (voiceMessage && !isLoading) {
                messageInput.value = voiceMessage;
                sendMessage({ fromVoice: true });
                return;
            }


            if (!isLoading && !isSpeaking) {
                startListeningIfReady();
            }
        };


        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            updateVoiceButton();


            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                voiceConversationMode = false;
                alert('Microphone permission is blocked. Please allow microphone access and try again.');
            }
        };
    }
}


// ========================
// CHAT FUNCTIONS (PUTER.JS)
// ========================


async function sendMessage(options = {}) {
    const fromVoice = options.fromVoice === true;
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
   
    if (!message || isLoading) return;
   
    const imageCommandPrefix = '/image ';
    const videoCommandPrefix = '/video ';
   
    const imageTriggerPatterns = /^(generate|create|draw|make|paint|design|build|render|imagine|craft|visualize|depict|illustrate|sketch|conceive)\s+(?:an?\s+)?(image|picture|photo|artwork|graphic|illustration|drawing|painting|visual)/i;
    const videoTriggerPatterns = /^(generate|create|make|produce|film|shoot|render)\s+(?:an?\s+)?(video|clip|scene|sequence|footage|animation)/i;


    if (message.toLowerCase().startsWith(videoCommandPrefix)) {
        const prompt = message.slice(videoCommandPrefix.length).trim();
        if (!prompt) {
            alert('Please provide a video prompt after /video');
            return;
        }
        await generateVideoFromPrompt(prompt);
        return;
    }


    if (message.toLowerCase().startsWith(imageCommandPrefix)) {
        const prompt = message.slice(imageCommandPrefix.length).trim();
        if (!prompt) {
            alert('Please provide an image prompt after /image');
            return;
        }
        await generateImageFromPrompt(prompt);
        return;
    }


    if (videoTriggerPatterns.test(message)) {
        const prompt = message.replace(/^(generate|create|make|produce|film|shoot|render)\s+(?:an?\s+)?(video|clip|scene|sequence|footage|animation)\s+/i, '').trim();
        if (prompt) {
            await generateVideoFromPrompt(prompt);
            return;
        }
    }


    if (imageTriggerPatterns.test(message)) {
        const prompt = message.replace(/^(generate|create|draw|make|paint|design|build|render|imagine|craft|visualize|depict|illustrate|sketch|conceive)\s+(?:an?\s+)?(image|picture|photo|artwork|graphic|illustration|drawing|painting|visual)\s+/i, '').trim();
        if (prompt) {
            await generateImageFromPrompt(prompt);
            return;
        }
    }


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
       
        // Read aloud only during voice conversation mode.
        if (fromVoice && voiceConversationMode && document.getElementById('readAloud')?.checked) {
            await speakText(aiResponse);
        }
    } catch (error) {
        console.error('❌ Puter.js Error:', error);
        removeLoadingIndicator(loadingId);
       
        const errorMessage = `Error: ${error.message || 'Failed to get response from Puter.js'}`;
        addMessage('ai', errorMessage);
    } finally {
        latestFinalTranscript = '';
        latestInterimTranscript = '';
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();


        if (fromVoice && voiceConversationMode && !isListening && !isSpeaking) {
            startListeningIfReady();
        }
    }
}


async function generateImagePrompt() {
    if (isLoading) return;
    const prompt = window.prompt('Describe the image you want to generate:');
    if (!prompt || !prompt.trim()) return;
    await generateImageFromPrompt(prompt.trim());
}


async function generateVideoPrompt() {
    if (isLoading) return;
    const prompt = window.prompt('Describe the video you want to generate:');
    if (!prompt || !prompt.trim()) return;
    await generateVideoFromPrompt(prompt.trim());
}


async function generateVideoFromPrompt(prompt) {
    if (!prompt || isLoading) return;


    if (typeof puter?.ai?.txt2vid !== 'function') {
        addMessage('ai', '❌ Video generation is not available in this Puter.js version.');
        return;
    }


    isLoading = true;
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;


    addMessage('user', `/video ${prompt}`);
    messageHistory.push({ role: 'user', content: `/video ${prompt}` });


    const loadingId = showLoadingIndicator();


    try {
        const model = document.getElementById('videoModel')?.value || 'sora-2-pro';
        const seconds = Number(document.getElementById('videoSeconds')?.value || 8);
        const size = document.getElementById('videoSize')?.value || '1280x720';
        const testMode = document.getElementById('videoTestMode')?.checked === true;


        const options = {
            model,
            seconds,
            size,
            testMode
        };


        let videoResult;
        try {
            videoResult = await puter.ai.txt2vid(prompt, options);
        } catch (err) {
            if (testMode) {
                videoResult = await puter.ai.txt2vid(prompt, true);
            } else {
                throw err;
            }
        }


        removeLoadingIndicator(loadingId);


        const videoElement = normalizeVideoResult(videoResult);
        if (!videoElement) {
            throw new Error('Unable to parse video result from Puter.js');
        }


        addVideoMessage('ai', videoElement, `🎬 Generated video for: ${prompt}`);
        messageHistory.push({ role: 'assistant', content: `Generated video for: ${prompt}` });


        if (!currentChatId) {
            currentChatId = 'chat-' + Date.now();
        }
        saveConversation(currentChatId);


        videoElement.addEventListener('loadeddata', () => {
            videoElement.play().catch(() => {});
        });
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage('ai', `❌ Video generation failed: ${error.message}`);
    } finally {
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}


async function generateImageFromPrompt(prompt) {
    if (!prompt || isLoading) return;


    isLoading = true;
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;


    addMessage('user', `/image ${prompt}`);
    messageHistory.push({ role: 'user', content: `/image ${prompt}` });


    const loadingId = showLoadingIndicator();


    try {
        let result;


        if (typeof puter?.ai?.txt2img === 'function') {
            result = await puter.ai.txt2img(prompt);
        } else if (typeof puter?.ai?.image === 'function') {
            result = await puter.ai.image(prompt);
        } else if (typeof puter?.ai?.generateImage === 'function') {
            result = await puter.ai.generateImage(prompt);
        } else {
            throw new Error('Image generation is not available in this Puter.js version.');
        }


        removeLoadingIndicator(loadingId);


        const imageUrl = extractImageUrl(result);
        if (!imageUrl) {
            throw new Error('Unable to parse image result from Puter.js');
        }


        addImageMessage('ai', imageUrl, `Generated image for: ${prompt}`);
        messageHistory.push({ role: 'assistant', content: `Generated image: ${imageUrl}` });


        if (!currentChatId) {
            currentChatId = 'chat-' + Date.now();
        }
        saveConversation(currentChatId);
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage('ai', `❌ Image generation failed: ${error.message}`);
    } finally {
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}


function addImageMessage(role, imageUrl, caption = '') {
    const container = document.getElementById('messagesContainer');
    const welcome = container.querySelector('.welcome-section');
    if (welcome) welcome.remove();


    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.style.display = 'block';


    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;


    const safeCaption = caption ? `<p>${escapeHtml(caption)}</p>` : '';
    messageDiv.innerHTML = `${safeCaption}<img src="${imageUrl}" alt="Generated image" style="max-width: min(100%, 420px); border-radius: 10px; margin-top: 8px;" />`;


    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}


function extractImageUrl(result) {
    if (!result) return '';


    if (typeof result === 'string') {
        const trimmed = result.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('data:image/')) {
            return trimmed;
        }
        if (/^[A-Za-z0-9+/=\r\n]+$/.test(trimmed) && trimmed.length > 100) {
            return `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
        }
        return '';
    }


    const candidates = [
        result.url,
        result.src,
        result.image,
        result.image_url,
        result.data,
        result.base64,
        result.b64,
        result.output
    ];


    for (const value of candidates) {
        if (!value) continue;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.startsWith('http') || trimmed.startsWith('data:image/')) {
                return trimmed;
            }
            if (/^[A-Za-z0-9+/=\r\n]+$/.test(trimmed) && trimmed.length > 100) {
                return `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
            }
        }
    }


    return '';
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
                <h2>👋 Welcome to FluffyyAI</h2>
                <p>Powered by <strong>D1Fluffyy</strong> and 400+ models</p>
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
           
        } catch (error) {
            removeLoadingIndicator(loadingId);
            addMessage('ai', `❌ Error analyzing image: ${error.message}`);
        }
    };
    reader.readAsDataURL(file);
}


async function handleSpeechToTextUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;


    if (typeof puter?.ai?.speech2txt !== 'function') {
        addMessage('ai', '❌ Speech-to-text is not available in this Puter.js version.');
        event.target.value = '';
        return;
    }


    if (isLoading) {
        event.target.value = '';
        return;
    }


    isLoading = true;
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;


    addMessage('user', `📝 Transcribe audio: ${file.name}`);
    messageHistory.push({ role: 'user', content: `Transcribe audio request: ${file.name}` });


    const loadingId = showLoadingIndicator();


    try {
        const audioDataUrl = await readFileAsDataUrl(file);
        const transcriptResult = await puter.ai.speech2txt(audioDataUrl);
        const transcript = extractTranscriptText(transcriptResult);


        removeLoadingIndicator(loadingId);


        if (!transcript) {
            throw new Error('Transcript was empty.');
        }


        addMessage('ai', `🗒️ Transcript:\n${transcript}`);
        messageHistory.push({ role: 'assistant', content: `Transcript: ${transcript}` });


        if (!currentChatId) {
            currentChatId = 'chat-' + Date.now();
        }
        saveConversation(currentChatId);
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage('ai', `❌ Transcription failed: ${error.message}`);
    } finally {
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();
        event.target.value = '';
    }
}


async function handleVoiceChangeUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;


    if (typeof puter?.ai?.speech2speech !== 'function') {
        addMessage('ai', '❌ Voice change is not available in this Puter.js version.');
        event.target.value = '';
        return;
    }


    if (isLoading) {
        event.target.value = '';
        return;
    }


    isLoading = true;
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;


    const voiceId = document.getElementById('voiceChangeVoice')?.value?.trim() || '21m00Tcm4TlvDq8ikWAM';
    const model = document.getElementById('voiceChangeModel')?.value || 'eleven_multilingual_sts_v2';


    addMessage('user', `🎚️ Voice change: ${file.name}`);
    messageHistory.push({ role: 'user', content: `Voice change request: ${file.name}` });


    const loadingId = showLoadingIndicator();


    try {
        const audioDataUrl = await readFileAsDataUrl(file);


        const converted = await puter.ai.speech2speech(audioDataUrl, {
            voice: voiceId,
            model,
            output_format: 'mp3_44100_128'
        });


        removeLoadingIndicator(loadingId);


        const audioElement = normalizeAudioResult(converted);
        if (!audioElement) {
            throw new Error('Unable to parse converted audio result.');
        }


        addAudioMessage('ai', audioElement, `🔊 Voice changed (${voiceId})`);
        messageHistory.push({ role: 'assistant', content: `Voice changed audio generated with voice ${voiceId}` });


        if (!currentChatId) {
            currentChatId = 'chat-' + Date.now();
        }
        saveConversation(currentChatId);


        try {
            await audioElement.play();
        } catch (_) {
            // Autoplay may be blocked by browser policy.
        }
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage('ai', `❌ Voice change failed: ${error.message}`);
    } finally {
        isLoading = false;
        messageInput.disabled = false;
        messageInput.focus();
        event.target.value = '';
    }
}


function addAudioMessage(role, audioElement, caption = '') {
    const container = document.getElementById('messagesContainer');
    const welcome = container.querySelector('.welcome-section');
    if (welcome) welcome.remove();


    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.style.display = 'block';


    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;


    if (caption) {
        const captionEl = document.createElement('p');
        captionEl.textContent = caption;
        messageDiv.appendChild(captionEl);
    }


    audioElement.controls = true;
    audioElement.style.width = '100%';
    audioElement.style.maxWidth = '420px';
    audioElement.style.marginTop = '8px';
    messageDiv.appendChild(audioElement);


    if (audioElement.src) {
        const downloadLink = document.createElement('a');
        downloadLink.href = audioElement.src;
        downloadLink.download = 'fluffyyai-voice-change.mp3';
        downloadLink.textContent = 'Download audio';
        downloadLink.style.display = 'inline-block';
        downloadLink.style.marginTop = '8px';
        downloadLink.style.color = 'inherit';
        messageDiv.appendChild(downloadLink);
    }


    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}


function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read audio file.'));
        reader.readAsDataURL(file);
    });
}


function normalizeAudioResult(result) {
    if (!result) return null;


    if (result instanceof HTMLAudioElement) {
        return result;
    }


    if (result instanceof HTMLMediaElement && result.tagName?.toLowerCase() === 'audio') {
        return result;
    }


    const srcCandidates = [];


    if (typeof result === 'string') {
        srcCandidates.push(result);
    } else if (typeof result === 'object') {
        srcCandidates.push(
            result.src,
            result.url,
            result.audio,
            result.output,
            result.data,
            result.base64,
            result.b64
        );
    }


    for (const src of srcCandidates) {
        if (!src || typeof src !== 'string') continue;
        const trimmed = src.trim();
        if (!trimmed) continue;


        const audio = new Audio();
        if (trimmed.startsWith('http') || trimmed.startsWith('data:audio/')) {
            audio.src = trimmed;
        } else if (/^[A-Za-z0-9+/=\r\n]+$/.test(trimmed) && trimmed.length > 100) {
            audio.src = `data:audio/mpeg;base64,${trimmed.replace(/\s+/g, '')}`;
        } else {
            continue;
        }
        return audio;
    }


    return null;
}


function extractTranscriptText(result) {
    if (!result) return '';


    if (typeof result === 'string') {
        return result.trim();
    }


    const candidates = [result.text, result.transcript, result.output, result.data];
    for (const value of candidates) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }


    return '';
}


function normalizeVideoResult(result) {
    if (!result) return null;


    if (result instanceof HTMLVideoElement) {
        return result;
    }


    if (result instanceof HTMLMediaElement && result.tagName?.toLowerCase() === 'video') {
        return result;
    }


    const srcCandidates = [];


    if (typeof result === 'string') {
        srcCandidates.push(result);
    } else if (typeof result === 'object') {
        srcCandidates.push(
            result.src,
            result.url,
            result.video,
            result.output,
            result.data
        );
    }


    for (const src of srcCandidates) {
        if (!src || typeof src !== 'string') continue;
        const trimmed = src.trim();
        if (!trimmed) continue;


        const video = document.createElement('video');
        video.controls = true;
        video.muted = true;
        video.playsInline = true;


        if (trimmed.startsWith('http') || trimmed.startsWith('data:video/')) {
            video.src = trimmed;
            return video;
        }


        if (/^[A-Za-z0-9+/=\r\n]+$/.test(trimmed) && trimmed.length > 100) {
            video.src = `data:video/mp4;base64,${trimmed.replace(/\s+/g, '')}`;
            return video;
        }
    }


    return null;
}


function addVideoMessage(role, videoElement, caption = '') {
    const container = document.getElementById('messagesContainer');
    const welcome = container.querySelector('.welcome-section');
    if (welcome) welcome.remove();


    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.style.display = 'block';


    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;


    if (caption) {
        const captionEl = document.createElement('p');
        captionEl.textContent = caption;
        messageDiv.appendChild(captionEl);
    }


    videoElement.style.width = '100%';
    videoElement.style.maxWidth = '420px';
    videoElement.style.marginTop = '8px';
    messageDiv.appendChild(videoElement);


    if (videoElement.src) {
        const downloadLink = document.createElement('a');
        downloadLink.href = videoElement.src;
        downloadLink.download = 'fluffyyai-generated-video.mp4';
        downloadLink.textContent = 'Download video';
        downloadLink.style.display = 'inline-block';
        downloadLink.style.marginTop = '8px';
        downloadLink.style.color = 'inherit';
        messageDiv.appendChild(downloadLink);
    }


    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}


// ========================
// VOICE FUNCTIONS
// ========================


function toggleVoiceInput() {
    if (!recognition) {
        alert('Speech recognition not supported in your browser');
        return;
    }


    if (!voiceConversationMode) {
        voiceConversationMode = true;
        startListeningIfReady();
    } else {
        voiceConversationMode = false;
        latestFinalTranscript = '';
        latestInterimTranscript = '';
        if (isListening) {
            recognition.stop();
        }
        if (synthesizer.speaking) {
            synthesizer.cancel();
            isSpeaking = false;
        }
        updateVoiceButton();
    }
}


function updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    if (voiceConversationMode || isListening || isSpeaking) {
        btn.classList.add('active');
        btn.textContent = '⏹️';
    } else {
        btn.classList.remove('active');
        btn.textContent = '🎤';
    }
}


function speakText(text) {
    return new Promise((resolve) => {
        if (!synthesizer || !text) {
            resolve();
            return;
        }


        if (synthesizer.speaking) {
            synthesizer.cancel();
        }


        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;


        isSpeaking = true;
        updateVoiceButton();


        utterance.onend = () => {
            isSpeaking = false;
            updateVoiceButton();
            resolve();
        };


        utterance.onerror = () => {
            isSpeaking = false;
            updateVoiceButton();
            resolve();
        };


        synthesizer.speak(utterance);
    });
}


function startListeningIfReady() {
    if (!recognition || !voiceConversationMode || isListening || isLoading || isSpeaking) {
        return;
    }


    try {
        recognition.start();
    } catch (error) {
        console.warn('Speech recognition start was ignored:', error);
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

