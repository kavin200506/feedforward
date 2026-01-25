import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './chatbot.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using gemini-1.5-flash which is a stable and widely available model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to help you with FeedForward. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDragStart = (e) => {
    if (!chatWindowRef.current) return;
    
    const rect = chatWindowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - (chatWindowRef.current?.offsetWidth || 350);
    const maxY = window.innerHeight - (chatWindowRef.current?.offsetHeight || 500);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // Cache for available model
  const availableModelRef = useRef(null);

  // Function to get available model
  const getAvailableModel = async () => {
    // Return cached model if available
    if (availableModelRef.current) {
      return availableModelRef.current;
    }

    try {
      // Try to list available models
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
      console.log('Fetching available models from:', listUrl.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(listUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available models response:', data);
        const models = data.models || [];
        
        // Log all available models
        console.log('Total models found:', models.length);
        models.forEach(model => {
          console.log(`- ${model.name} (supports: ${model.supportedGenerationMethods?.join(', ') || 'none'})`);
        });
        
        // Find a model that supports generateContent
        const supportedModel = models.find(model => 
          model.supportedGenerationMethods?.includes('generateContent')
        );
        
        if (supportedModel) {
          // Extract model name (remove 'models/' prefix if present)
          const modelName = supportedModel.name.replace('models/', '');
          availableModelRef.current = modelName;
          console.log('✅ Found available model:', modelName);
          return modelName;
        } else {
          console.warn('⚠️ No model found that supports generateContent');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error fetching models:', response.status, errorData);
      }
    } catch (err) {
      console.warn('Could not fetch model list:', err);
    }

    // Fallback: try common model names
    const fallbackModels = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    console.log('Using fallback model:', fallbackModels[0]);
    return fallbackModels[0]; // Return first fallback
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }

      // Get available model
      const modelName = await getAvailableModel();

      // Try the model, with fallbacks if it fails
      const modelsToTry = [
        modelName,
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ].filter((m, i, arr) => arr.indexOf(m) === i); // Remove duplicates
      
      let lastError = null;
      let response = null;
      let data = null;
      let successfulModel = null;

      // Try each model until one works
      for (const model of modelsToTry) {
        try {
          // Try both with and without 'models/' prefix
          const modelVariations = [
            model,
            model.startsWith('models/') ? model : `models/${model}`
          ];

          for (const modelVar of modelVariations) {
            try {
              const apiUrl = `https://generativelanguage.googleapis.com/v1/${modelVar}:generateContent`;
              response = await fetch(
                `${apiUrl}?key=${GEMINI_API_KEY}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    contents: [
                      {
                        parts: [
                          {
                            text: `You are a helpful assistant for FeedForward, a food donation platform connecting restaurants with NGOs. Help users with questions about the platform, food donations, NGO registration, restaurant listings, and general inquiries. Keep responses concise and friendly.\n\nUser message: ${userMessage.text}`
                          }
                        ]
                      }
                    ]
                  })
                }
              );

              if (response.ok) {
                data = await response.json();
                successfulModel = modelVar;
                availableModelRef.current = model; // Cache the working model
                break; // Success, exit inner loop
              } else {
                const errorData = await response.json().catch(() => ({}));
                lastError = new Error(errorData.error?.message || `API error: ${response.status}`);
              }
            } catch (err) {
              lastError = err;
            }
          }

          if (response && response.ok) {
            break; // Success, exit outer loop
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!response || !response.ok) {
        // Clear cache if all models failed
        availableModelRef.current = null;
        throw lastError || new Error('Failed to connect to Gemini API. Please check your API key and model availability.');
      }
      
      if (successfulModel) {
        console.log(`Successfully using model: ${successfulModel}`);
      }

      // Extract text from Gemini response
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     'I apologize, but I could not generate a response. Please try again.';

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error.message}. Please try again later.`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Hello! I'm here to help you with FeedForward. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
        {!isOpen && messages.length > 1 && (
          <span className="chatbot-notification-badge">{messages.length - 1}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`chatbot-window ${isDragging ? 'dragging' : ''}`}
          style={{
            transform: position.x || position.y ? `translate(${position.x}px, ${position.y}px)` : 'none'
          }}
        >
          {/* Header */}
          <div
            className="chatbot-header"
            onMouseDown={handleDragStart}
          >
            <div className="chatbot-header-content">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="chatbot-title">FeedForward Assistant</h3>
                  <p className="chatbot-subtitle">Online</p>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button
                  className="chatbot-action-btn"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
                <button
                  className="chatbot-action-btn"
                  onClick={handleToggle}
                  aria-label="Close chatbot"
                  title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="chatbot-loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-container">
            <div className="chatbot-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="chatbot-send-btn"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;

