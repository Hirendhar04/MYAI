from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import os

# Create necessary directories
os.makedirs('templates', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)

app = Flask(__name__)
CORS(app)

# ========================
# PUTER.JS SERVERLESS APPROACH
# ========================
# This app uses Puter.js for 400+ free LLM models
# No API keys needed - Users pay for their own usage
# No backend AI infrastructure required

@app.route('/')
def index():
    """Serve the main application"""
    return render_template('index.html')

@app.route('/api/models', methods=['GET'])
def get_models():
    """Return list of available Puter.js models"""
    models = {
        # OpenAI Models
        "gpt-5-nano": {"name": "🚀 GPT-5 Nano (Fastest)", "provider": "openai", "tier": "fast"},
        "gpt-5-small": {"name": "⚡ GPT-5 Small (Fast)", "provider": "openai", "tier": "fast"},
        "gpt-4": {"name": "🔵 GPT-4 (Capable)", "provider": "openai", "tier": "capable"},
        "gpt-4-turbo": {"name": "🔥 GPT-4 Turbo", "provider": "openai", "tier": "capable"},
        
        # Anthropic Models
        "claude-sonnet-4": {"name": "🏛️ Claude Sonnet 4 (Balanced)", "provider": "anthropic", "tier": "capable"},
        "claude-sonnet-4-5": {"name": "👑 Claude Sonnet 4.5 (Latest)", "provider": "anthropic", "tier": "capable"},
        "claude-opus": {"name": "🎓 Claude Opus (Most Capable)", "provider": "anthropic", "tier": "powerful"},
        
        # Google Models
        "gemini-2-pro": {"name": "🔷 Gemini 2 Pro", "provider": "google", "tier": "capable"},
        "gemini-1-5-pro": {"name": "💎 Gemini 1.5 Pro", "provider": "google", "tier": "capable"},
        "gemini-flash": {"name": "⚡ Gemini Flash", "provider": "google", "tier": "fast"},
        
        # xAI Models
        "grok-3": {"name": "🤖 Grok-3 (xAI)", "provider": "xai", "tier": "capable"},
        "grok-2": {"name": "🎯 Grok-2 (xAI)", "provider": "xai", "tier": "capable"},
        
        # DeepSeek Models
        "deepseek/deepseek-r1": {"name": "🧠 DeepSeek R1 (Reasoning)", "provider": "deepseek", "tier": "capable"},
        "deepseek/deepseek-v3": {"name": "🚀 DeepSeek V3", "provider": "deepseek", "tier": "capable"},
        
        # Meta Models
        "llama-3-1": {"name": "🦙 Llama 3.1 (Open Source)", "provider": "meta", "tier": "capable"},
        "llama-3": {"name": "🦙 Llama 3 (Open Source)", "provider": "meta", "tier": "fast"},
        
        # Mistral Models
        "mistral-large": {"name": "🌀 Mistral Large", "provider": "mistral", "tier": "capable"},
        "mistral-nemo": {"name": "💨 Mistral Nemo", "provider": "mistral", "tier": "fast"},
        
        # Other Models
        "command-r": {"name": "🎤 Cohere Command R", "provider": "cohere", "tier": "capable"},
        "nova-pro": {"name": "✨ Amazon Nova Pro", "provider": "aws", "tier": "capable"},
    }
    return jsonify(models)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'AI Assistant is running with Puter.js'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)

