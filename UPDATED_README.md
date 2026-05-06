# ChatGPT-Like AI Assistant Powered by Puter.js

A modern, ChatGPT-inspired web application with **free access to 400+ LLM models** using **Puter.js**. No API keys, no backend costs, no infrastructure headaches!

## 🌟 Key Features

### ✨ What Makes This Special
- **400+ Free LLM Models**: Access OpenAI, Claude, Gemini, Grok, DeepSeek, Llama, and more
- **Zero Backend Costs**: Users pay for their own usage (User-Pays model)
- **No API Keys Required**: Completely serverless approach
- **Instant Setup**: No configuration needed, just run!
- **Modern UI**: ChatGPT-like interface with dark mode

### 🎯 Core Features
- **Multi-LLM Support**: Instant access to 400+ models without API keys
- **ChatGPT-Like Interface**: Modern, responsive UI with sidebar navigation
- **Conversation History**: Local storage of chat history
- **Dark/Light Mode**: Toggle between themes
- **Model Switching**: Instantly switch between different LLMs

### 🎤 Voice Capabilities
- **Voice Input**: Record and transcribe your messages
- **Voice Output**: AI reads responses aloud (optional)
- **Real-time Transcription**: Live transcription as you speak

### 🖼️ Image Features
- **Image Upload**: Drag and drop or select images
- **Image Analysis**: AI analyzes and describes images
- **Image Display**: Preview images in chat

### ⚙️ Advanced Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Streaming Responses**: Real-time response streaming
- **Local Storage**: Conversation history saved locally
- **Download Chat**: Export conversations as text

## 🚀 Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Puter.js)

### 1. Clone & Setup
```bash
# Navigate to project directory
cd MYAI-main

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

That's it! No `.env` file needed, no API keys to manage!

### 3. Run the Application
```bash
python app.py
```

The application will start on **http://localhost:5000**

## 💡 Usage

### Starting a Chat
1. Open http://localhost:5000 in your browser
2. Select an LLM model from the dropdown (e.g., GPT-5 Nano, Claude Sonnet)
3. Type your message or use voice input
4. Press Enter or click the send button
5. Get instant responses powered by Puter.js!

### Voice Input
1. Click the 🎤 microphone button
2. Speak your message clearly
3. The transcription appears in the input field
4. Press Enter to send

### Uploading Images
1. Click the 🖼️ image button
2. Select an image file from your computer
3. The AI analyzes and describes the image
4. Ask follow-up questions about the image

### Managing Conversations
- **New Chat**: Click "New Chat" or the "+" button
- **Load Previous**: Click any conversation in the sidebar
- **Delete**: Right-click on a conversation to delete
- **Download**: Click the 💾 button to download current chat

## 📊 Available LLM Models

### Lightning Fast (Best for Quick Responses)
- **GPT-5 Nano** - Ultra-fast OpenAI model
- **Gemini Flash** - Fast Google model
- **Mistral Nemo** - Fast open-source model

### Balanced (Great All-Purpose)
- **GPT-5 Small** - Balanced OpenAI model
- **GPT-4 Turbo** - Capable OpenAI model
- **Claude Sonnet 4.5** - Latest Claude model
- **Gemini 2 Pro** - Advanced Google model

### Powerful (Best for Complex Tasks)
- **Claude Opus** - Most capable Claude model
- **DeepSeek R1** - Advanced reasoning model
- **Llama 3.1** - Powerful open-source model
- **Mistral Large** - Advanced Mistral model

### Specialized
- **Grok-3** - Unique xAI model
- **DeepSeek V3** - Latest DeepSeek model

## 🏗️ Architecture

```
MYAI-main/
├── app.py              # Flask app with Puter.js integration
├── requirements.txt    # Minimal dependencies (Flask only!)
├── templates/
│   └── index.html      # Main HTML with Puter.js
├── static/
│   ├── css/
│   │   └── style.css   # Modern ChatGPT-like styles
│   └── js/
│       └── script.js   # Frontend logic using Puter.js
└── README.md          # This file
```

## 💰 Cost Model

### For Users
- Pay per token used (through Puter.js)
- Transparent pricing
- No hidden fees
- No subscription required

### For Developers
- **ZERO backend costs**
- No server bills
- No API key management
- No rate limit worries
- No infrastructure to maintain

This is the revolutionary "User-Pays" model!

## 🔧 API Endpoints

The backend is minimal - mostly just serving static files:

```
GET  /                  # Main page
GET  /api/models        # List available models (optional)
GET  /api/health        # Health check
```

All AI processing happens in the **browser** using Puter.js!

## 🎨 Customization

### Change Default Model
Edit `script.js`:
```javascript
let currentModel = 'gpt-5-nano';  // Change this
```

### Modify Colors/Theme
Edit `style.css` and update the CSS variables:
```css
:root {
    --primary-color: #10a37f;
    /* ... modify colors ... */
}
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚨 Troubleshooting

### "Puter.js failed to load"
- Check your internet connection
- The Puter.js CDN might be temporarily unavailable
- Refresh the page and try again

### Voice input not working
- Check browser microphone permissions
- Make sure a microphone is connected
- Try Chrome or Edge browser (best support)
- Check microphone in browser settings

### Image analysis not available
- Not all models support image analysis
- Try GPT-4 Turbo or Claude Sonnet
- Make sure image is valid and under 10MB

### Responses are slow
- Try a faster model (GPT-5 Nano, Gemini Flash)
- Check your internet connection
- Peak usage times may affect speed
- Puter.js load might be high

## 📚 Learning Resources

- **Puter.js Docs**: https://puter.com/docs
- **Puter.js Tutorial**: https://docs.puter.com/ai
- **Available Models**: https://puter.com/models

## 🎯 Future Enhancements

- [ ] Pinned conversations
- [ ] Search chat history
- [ ] Custom conversation naming
- [ ] Export to multiple formats
- [ ] Conversation sharing
- [ ] Advanced settings panel
- [ ] Keyboard shortcuts guide
- [ ] Multi-language support

## 📝 License

MIT License - Use freely and modify as needed

## 🙏 Credits

- Built with **Flask** (backend)
- Powered by **Puter.js** (AI models)
- Styled with **CSS3**
- Made with ❤️ for developers

## 🤝 Support & Contribution

- Report issues or suggest features
- Contribute improvements via pull requests
- Star the repo if you find it useful!

---

## Quick Start Command

```bash
# Setup and run in one go:
git clone <repo-url> && cd MYAI-main && python -m venv venv && \
(source venv/bin/activate || venv\Scripts\activate) && \
pip install -r requirements.txt && python app.py
```

Then open **http://localhost:5000** and start chatting! 🚀

---

**Powered by Puter.js • Free for Everyone • No API Keys Required**

Learn more about the User-Pays model: https://puter.com

