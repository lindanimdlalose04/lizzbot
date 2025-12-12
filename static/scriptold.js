class ChatApp {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.querySelector('.icon-btn');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.clearButton.addEventListener('click', () => this.clearChat());
        
        // Focus input on load
        this.userInput.focus();
        
        // Load chat history from localStorage
        this.loadChatHistory();
    }
    removeEmojis(text) {
        // This regex removes most common emojis
        return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.userInput.value = '';
        
        // Disable input and button while processing
        this.setInputState(false);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            if (data.status === 'success') {
                // Add bot response
                this.addMessage(data.response, 'bot');
            } else {
                this.addMessage(`Error: ${data.error || 'Something went wrong'}`, 'bot', true);
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
            console.error('Error:', error);
        } finally {
            // Re-enable input and button
            this.setInputState(true);
            this.saveChatHistory();
        }
    }
    
    addMessage(content, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let messageContent = content;
    // Remove emojis from bot messages
    if (sender === 'bot' && !isError) {
            messageContent = this.removeEmojis(messageContent);
            
            messageContent = marked.parse(messageContent);
        }
    
    // Create avatar based on sender
    let avatarHtml;
    if (sender === 'user') {
        avatarHtml = '<i class="fas fa-user"></i>';
    } else {
        // Bot avatar - try image first, fallback to icon
        avatarHtml = '<img src="/static/bot-icon.jpg" alt="Bot Avatar" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<i class=\\"fas fa-robot\\"></i>\'">';
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarHtml}
        </div>
        <div class="message-content">
            <div class="message-text">
                ${isError ? `<p style="color: #f87171">${messageContent}</p>` : messageContent}
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
}
   showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    // Use the same image avatar as the bot messages
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="/static/bot-icon.jpg" alt="Bot Avatar" 
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\"fas fa-robot\"></i>'">
        </div>
        <div class="message-content">
            <div class="message-text">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    this.chatContainer.appendChild(typingDiv);
    this.scrollToBottom();
}
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    setInputState(enabled) {
        this.userInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        
        if (enabled) {
            this.userInput.focus();
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    }
    
    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear the chat?')) {
            // Keep only the welcome message
            const welcomeMessage = this.chatContainer.querySelector('.bot-message');
            this.chatContainer.innerHTML = '';
            
            if (welcomeMessage) {
                this.chatContainer.appendChild(welcomeMessage);
            } else {
                // Add welcome message if not present
                this.addMessage("Hello! I'm LizzBot. How can I help you today?", 'bot');
            }
            
            // Clear localStorage
            localStorage.removeItem('lizzbot_chat');
            this.scrollToBottom();
        }
    }
    
    saveChatHistory() {
        const messages = [];
        const messageElements = this.chatContainer.querySelectorAll('.message');
        
        messageElements.forEach(msg => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-text').innerText;
            const time = msg.querySelector('.message-time')?.innerText || '';
            
            if (content && !content.includes('typing-indicator')) {
                messages.push({
                    sender: isUser ? 'user' : 'bot',
                    content: content,
                    time: time
                });
            }
        });
        
        localStorage.setItem('lizzbot_chat', JSON.stringify(messages));
    }
    
    loadChatHistory() {
    try {
        const saved = localStorage.getItem('lizzbot_chat');
        if (saved) {
            const messages = JSON.parse(saved);
            
            // Clear current messages
            this.chatContainer.innerHTML = '';
            
            // Add welcome message (without emoji)
            this.addMessage("Hello! I'm LizzBot, your personal AI assistant. How can I help you today?", 'bot');
            
            // Add saved messages (filter out old welcome messages with emojis)
            messages.forEach(msg => {
                if (!msg.content.includes("👋") && !msg.content.includes("Hello!")) {
                    this.addMessage(msg.content, msg.sender);
                }
            });
            
            this.scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        // Add default welcome message
        this.addMessage("Hello! I'm LizzBot, your personal AI assistant. How can I help you today?", 'bot');
    }
}
    
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});