# lizzbot

# LizzBot - AI Chat Assistant

A sleek, AI chat interface built with Flask and DeepSeek AI.

## Features

- Modern UI with dark theme
- Real-time chat interface
- Fast responses using DeepSeek AI
- Fully responsive design
- Local chat history storage
- Customizable system prompts

## Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/lizzbot.git
cd lizzbot
\`\`\`

### 2. Install dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 3. Set up environment variables
\`\`\`bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# Get your key from: https://openrouter.ai/keys
\`\`\`

### 4. Run the application
\`\`\`bash
python app.py
\`\`\`

### 5. Open in browser
Visit \`http://localhost:5000\`

## Configuration

### API Key
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the [keys page](https://openrouter.ai/keys)
3. Add it to your \`.env\` file

Project Structure

\`\`\`
lizzbot/
├── app.py              
├── requirements.txt    
├── .env.example       # Example environment variables
├── static/            
│   ├── style.css      
│   ├── script.js     
│   └── bot-icon.png   
└── templates/        
    └── index.html     
\`\`\`
