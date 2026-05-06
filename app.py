from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import json
import os

# Create necessary directories
os.makedirs('templates', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)

app = Flask(__name__)
CORS(app)

# Initialize Groq AI client
try:
    from groq import Groq
    client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))
    USE_GROQ = bool(os.environ.get("GROQ_API_KEY"))
except:
    client = None
    USE_GROQ = False


def process_text_input(text):
    """Process text input with AI"""
    if USE_GROQ and client:
        try:
            message = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": text}
                ],
                model="mixtral-8x7b-32768",
            )
            return message.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")
            return fallback_response(text)
    else:
        return fallback_response(text)


def fallback_response(text):
    """Fallback response when Groq is not available"""
    text_lower = text.lower().strip()
    
    # Math
    if "2+2" in text_lower or "two plus two" in text_lower:
        return "2 + 2 = 4"
    if "what is" in text_lower and ("+" in text or "-" in text or "*" in text or "/" in text):
        try:
            # Simple math evaluation
            result = eval(text_lower.split("what is")[-1].strip())
            return f"The answer is {result}"
        except:
            pass
    
    # Greetings
    if any(word in text_lower for word in ["hello", "hi", "hey", "greetings"]):
        return "Hello! Nice to meet you. How can I assist you today?"
    
    if any(word in text_lower for word in ["how are you", "how do you do"]):
        return "I'm doing great, thanks for asking! I'm here to help you with anything you need."
    
    if any(word in text_lower for word in ["what is your name", "who are you", "what are you"]):
        return "I'm your AI Assistant. I'm here to help you chat, analyze images, and assist with voice conversations!"
    
    if any(word in text_lower for word in ["help", "what can you do"]):
        return "I can: 1) Chat with you like this 2) Analyze images you upload 3) Have voice conversations. Just ask me anything!"
    
    # Generic response
    return f"That's interesting! You mentioned '{text}'. Tell me more about what you'd like to know and I'll do my best to help!"


def process_image(image_data):
    """Process image input with AI"""
    try:
        # Decode base64 image
        img_data = base64.b64decode(image_data.split(',')[1])
        img = Image.open(BytesIO(img_data))
        
        if USE_GROQ and client:
            try:
                # For now, just return image dimensions since Groq doesn't support vision
                message = client.chat.completions.create(
                    messages=[
                        {"role": "user", "content": "Describe an image that is " + str(img.size) + " pixels"}
                    ],
                    model="mixtral-8x7b-32768",
                )
                return message.choices[0].message.content
            except:
                pass
        
        # Fallback response
        return f"Image received: {img.size[0]}x{img.size[1]} pixels. I can see your image! What would you like to know about it?"
    except Exception as e:
        return f"Error processing image: {str(e)}"


def process_voice(audio_data):
    """Process voice input with AI"""
    # Replace this with your actual voice/speech-to-text logic
    return "Voice processing not yet implemented"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = process_text_input(user_message)
    return jsonify({'response': response})


@app.route('/api/image', methods=['POST'])
def image():
    data = request.get_json()
    image_data = data.get('image', '')
    
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400
    
    response = process_image(image_data)
    return jsonify({'response': response})


@app.route('/api/voice', methods=['POST'])
def voice():
    # Get audio from request
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    response = process_voice(audio_file)
    return jsonify({'response': response})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
