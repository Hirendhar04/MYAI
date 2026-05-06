# AI Web Application

This is a starter project for an AI-powered web application with chat, image recognition, and voice interaction capabilities.

## Features
- **Chat Interface**: Real-time chat with your AI
- **Image Recognition**: Upload and analyze images
- **Voice Assistant**: Record and process voice commands

## Project Structure

```
.
├── app.py                 # Flask backend
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── script.js     # Frontend logic
└── requirements.txt      # Python dependencies
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

3. Open your browser and navigate to: `http://localhost:5000`

## Configuration

Edit `app.py` to integrate your AI models:
- `process_text_input()` - Handle text queries
- `process_image()` - Handle image analysis
- `process_voice()` - Handle voice input

## Dependencies

- Flask - Web framework
- Flask-CORS - Cross-Origin Resource Sharing
- Pillow - Image processing
