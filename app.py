from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Get API key
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# Check if API key is set
if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == 'your_api_key_here':
    print("WARNING: OPENROUTER_API_KEY not set or is default!")
    print("Please set your API key in the .env file")
    print("Get your key from: https://openrouter.ai/keys")


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Add a system prompt to make responses brief
        system_prompt = """You are LizzBot, a helpful AI assistant. Follow these rules:
        1. Be concise and to the point
        2. Use simple language
        3. Keep responses short (1-3 sentences maximum)
        4. Avoid unnecessary details
        5. Answer directly without long introductions
        6. Use bullet points only when absolutely necessary
        7. Be blunt when appropriate"""
        
        # Make request to OpenRouter API with system message
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": request.host_url,
                "X-Title": "LizzBot",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek/deepseek-r1",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                # Add parameters to control response length
                "max_tokens": 150,  # Limit response length
                "temperature": 0.7,  # Lower = more focused, less creative
            },
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        bot_response = data.get('choices', [{}])[0].get('message', {}).get('content', 'No response received')
        
        return jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)