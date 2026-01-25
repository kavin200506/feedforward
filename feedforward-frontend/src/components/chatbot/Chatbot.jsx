import React, { useState, useRef, useEffect } from 'react';
import { IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import './Chatbot.css';

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hi there! 👋 I'm your FeedForward assistant. How can I help you today?",
  sender: 'bot',
  isWelcome: true
};

const SUGGESTIONS = [
  "How do I donate food?",
  "Check my pickup status",
  "Help for NGOs",
  "Contact support"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  
  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false); // To distinguish click vs drag

  const messagesEndRef = useRef(null);

  // Load saved position
  useEffect(() => {
    const savedPos = localStorage.getItem('chatbot_position');
    if (savedPos) {
      const parsed = JSON.parse(savedPos);
      // Basic bounds check to ensure it's on screen
      if (parsed.x < window.innerWidth && parsed.y < window.innerHeight && parsed.x > 0 && parsed.y > 0) {
        setPosition(parsed);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // --- Drag Logic ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setHasMoved(false);
    
    // Calculate offset from the top-left of the element
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    e.stopPropagation(); // Prevent other interactions
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    setHasMoved(true);

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Boundary checks (keep within window)
    const maxX = window.innerWidth - 60; // 60 is width of icon roughly
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY)
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('chatbot_position', JSON.stringify(position));
    }
  };

  // Attach global mouse listeners for smoother dragging even if cursor leaves element
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleChat = () => {
    if (!hasMoved) {
      setIsOpen(!isOpen);
    }
  };

  // --- Chat Logic ---
  const handleSendMessage = (textOverride = null) => {
    const text = textOverride || inputValue.trim();
    if (!text) return;

    // Add user message
    const newMessage = {
      id: Date.now(),
      text: text,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate Bot Typing/Response
    setTimeout(() => {
      const botResponse = generateResponse(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot'
      }]);
    }, 600);
  };

  const generateResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('donate') || lowerInput.includes('give food')) {
      return "To donate food, log in as a Restaurant or Donor and click 'Create Listing' on your dashboard. Need help with the form?";
    }
    if (lowerInput.includes('pickup') || lowerInput.includes('status') || lowerInput.includes('track')) {
      return "You can check the status of your pickups in the 'History' or 'Requests' tab of your dashboard.";
    }
    if (lowerInput.includes('ngo') || lowerInput.includes('charity')) {
      return "NGOs can browse available food listings and request pickups. Are you representing an NGO?";
    }
    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return "I can help with: \n1. Donating Food \n2. Tracking Pickups \n3. NGO Registration \n\nWhat do you need assistance with?";
    }
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! How can I help you reduce food waste today?";
    }

    return "I'm still learning! For specific account issues, please contact our support team or check the 'How It Works' page.";
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div 
      className="chatbot-container"
      style={{ 
        left: position.x, 
        top: position.y 
      }}
    >
      {/* Chat Window - Renders relative to the container */}
      {isOpen && (
        <div className="chatbot-window">
          <div 
            className="chatbot-header"
            onMouseDown={handleMouseDown} // Allow dragging from header too
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div style={{ display: 'flex', itemsAlign: 'center', gap: '8px' }}>
              <SmartToyIcon fontSize="small" />
              <h4>FeedForward Assistant</h4>
            </div>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
                {msg.isWelcome && (
                  <div className="quick-actions">
                    {SUGGESTIONS.map(s => (
                      <div 
                        key={s} 
                        className="action-chip" 
                        onClick={() => handleSendMessage(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="send-button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Icon */}
      {!isOpen && (
        <div 
          className="chatbot-icon"
          onMouseDown={handleMouseDown}
          onClick={toggleChat}
          title="Chat with us"
        >
          <ChatIcon />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
