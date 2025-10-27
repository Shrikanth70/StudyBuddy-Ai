import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send, Bot, User, Upload,
  History, Trash2, Copy,
  RotateCcw, Lightbulb, Sparkles, X, Loader2,
  Menu, Plus, MessageSquare, Check, Edit3, MoreVertical
} from 'lucide-react';
// import { useNavigate } from 'react-router-dom'; // Keep if login prompt needs it
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';


const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Sidebar and chat management state
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatTitle, setEditingChatTitle] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  // const navigate = useNavigate();
  const { user } = useAuth();

  const suggestions = [
    { icon: <Lightbulb size={18} />, text: "Explain photosynthesis step by step" },
    { icon: <Sparkles size={18} />, text: "Help me solve: 2x + 3 = 7" },
    { icon: <Lightbulb size={18} />, text: "What are the main causes of World War II?" },
    { icon: <Sparkles size={18} />, text: "Summarize the water cycle" },
  ];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user?._id) {
      fetchChatHistory();
    }
  }, [user]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const fetchChatHistory = async () => {
    if (!user?._id) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/chat/history/${user._id}`);
      if (response.data.messages?.length > 0) {
        // Group messages by conversation (using timestamp proximity or add conversationId later)
        const groupedChats = groupMessagesIntoChats(response.data.messages);
        setChats(groupedChats);

        // Select the most recent chat if none selected
        if (!selectedChatId && groupedChats.length > 0) {
          setSelectedChatId(groupedChats[0].id);
          setMessages(groupedChats[0].messages);
        }
        setShowSuggestions(false);
      } else {
        setChats([]);
        setMessages([]);
        setShowSuggestions(true);
      }
    } catch (err) {
      setError('Error fetching chat history.');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group messages into chat sessions using conversationId from backend
  const groupMessagesIntoChats = (messages) => {
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const chatsMap = new Map();

    sortedMessages.forEach((msg) => {
      const conversationId = msg.conversationId || 'default';
      if (!chatsMap.has(conversationId)) {
        chatsMap.set(conversationId, {
          id: conversationId,
          title: generateChatTitle([]),
          messages: [],
          lastMessage: new Date(msg.timestamp),
          createdAt: new Date(msg.timestamp)
        });
      }

      const chat = chatsMap.get(conversationId);
      chat.messages.push(msg);
      chat.lastMessage = new Date(msg.timestamp);
      chat.title = generateChatTitle(chat.messages);
    });

    return Array.from(chatsMap.values()).sort((a, b) => b.lastMessage - a.lastMessage); // Most recent first
  };

  // Generate chat title from first user message
  const generateChatTitle = (messages) => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.message;
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    return 'New Chat';
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: trimmedMessage,
      timestamp: new Date(),
      type: 'text'
    };

    // Add to current chat or create new one
    let currentChat = chats.find(chat => chat.id === selectedChatId);
    if (!currentChat) {
      currentChat = {
        id: `chat-${Date.now()}`,
        title: generateChatTitle([userMessage]),
        messages: [],
        lastMessage: new Date(),
        createdAt: new Date()
      };
      setChats(prev => [currentChat, ...prev]);
      setSelectedChatId(currentChat.id);
    }

    const updatedMessages = [...currentChat.messages, userMessage];
    currentChat.messages = updatedMessages;
    currentChat.lastMessage = new Date();
    currentChat.title = generateChatTitle(updatedMessages);

    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);
    setError('');

    try {
      const response = await api.post(`/chat/send`, {
        userId: user._id,
        message: userMessage.message,
        conversationId: selectedChatId
      });

      if (response.data.aiMessage) {
        const aiMessage = {
          id: response.data.aiMessage._id,
          sender: 'ai',
          message: response.data.aiMessage.message,
          timestamp: new Date(response.data.aiMessage.timestamp),
          type: 'text'
        };

        const finalMessages = [...updatedMessages, aiMessage];
        currentChat.messages = finalMessages;
        currentChat.title = generateChatTitle(finalMessages);

        setMessages(finalMessages);

        // Update chats list
        setChats(prev => prev.map(chat =>
          chat.id === currentChat.id ? currentChat : chat
        ));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setInputMessage(suggestionText);
    handleSendMessage(suggestionText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setShowSuggestions(true);
    setError('');
  };

  const handleSelectChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setSelectedChatId(chatId);
      setMessages(chat.messages);
      setShowSuggestions(false);
      setError('');
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!chatId) return;

    try {
      // For now, just remove from local state
      // In a full implementation, this would call an API to delete the chat
      setChats(prev => prev.filter(chat => chat.id !== chatId));

      if (selectedChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete chat.');
    }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    if (!newTitle.trim()) return;

    try {
      setChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
      ));
      setEditingChatId(null);
      setEditingChatTitle('');
    } catch (err) {
      setError('Failed to rename chat.');
    }
  };

  const handleCopyMessage = async (messageId, messageText) => {
    try {
      const tempEl = document.createElement('textarea');
      tempEl.value = messageText;
      document.body.appendChild(tempEl);
      tempEl.select();
      document.execCommand('copy');
      document.body.removeChild(tempEl);

      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      setError('Failed to copy message to clipboard.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedChatId === chat.id
                      ? 'bg-blue-900 border border-blue-700'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <input
                          value={editingChatTitle}
                          onChange={(e) => setEditingChatTitle(e.target.value)}
                          onBlur={() => handleRenameChat(chat.id, editingChatTitle)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameChat(chat.id, editingChatTitle);
                            } else if (e.key === 'Escape') {
                              setEditingChatId(null);
                              setEditingChatTitle('');
                            }
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {chat.title}
                          </p>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChatId(chat.id);
                                setEditingChatTitle(chat.title);
                              }}
                              className="p-1 hover:bg-gray-600 rounded text-white"
                              title="Rename chat"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                              }}
                              className="p-1 hover:bg-red-900 text-red-400 rounded"
                              title="Delete chat"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(chat.lastMessage).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg font-medium text-white">
              {selectedChatId ? chats.find(c => c.id === selectedChatId)?.title || 'Chat' : 'Chat'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-gray-900">
          {messages.length === 0 && !isLoading && showSuggestions && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-3xl font-medium text-white mb-8">
                Hello, {user?.name || 'there'}. How can I help today?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.text)}
                    className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-xl text-left hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="p-2 bg-gray-700 rounded-full">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto w-full space-y-6">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={18} className="text-white" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[85%]`}>
                  <div className={`p-4 rounded-2xl ${message.sender === 'user' ? 'bg-blue-900 text-white rounded-br-none' : 'bg-gray-800 shadow-sm border border-gray-700 rounded-bl-none'}`}>
                    {message.sender === 'user' ? (
                      <p className="text-base whitespace-pre-wrap">{message.message}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none text-white">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mb-3 text-white" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2 text-white" {...props} />,
                            p: ({ node, children, ...props }) => {
                              // Fix for DOM nesting error: <pre> cannot be inside <p>
                              if (node && node.children.length === 1 && node.children[0].tagName === 'code') {
                                return <>{children}</>;
                              }
                              // This is a regular <p> tag.
                              return <p className="mb-4 text-white" {...props}>{children}</p>;
                            },
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-white" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-white" {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline ? (
                                <pre className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto my-4 text-sm">
                                  <code className={match ? `language-${match[1]}` : ''} {...props}>
                                    {String(children).replace(/\n$/, '')}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-gray-700 text-purple-300 px-1.5 py-0.5 rounded-md text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center mt-2 px-2">
                    <button
                      onClick={() => handleCopyMessage(message.id, message.message)}
                      title="Copy"
                      className="text-gray-400 hover:text-gray-300"
                    >
                      {copiedMessageId === message.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={18} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages.length > 0 && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="p-4 rounded-2xl rounded-bl-none bg-gray-800 shadow-sm border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gray-800 border-t border-gray-700">
          <div className="max-w-3xl mx-auto w-full">
            {error && (
              <div className="flex justify-between items-center bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-3 text-sm">
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-2 text-red-300 hover:text-red-200">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex items-start gap-2 p-2 bg-gray-700 border border-gray-600 rounded-2xl shadow-sm">

              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here..."
                disabled={isLoading}
                rows={1}
                className="flex-1 py-3 px-2 bg-transparent text-base text-white placeholder-gray-400 resize-none border-none focus:ring-0 outline-none"
              />
              <button
                className="p-3 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2">Login Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please log in to start chatting with StudyBuddy AI.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  // navigate('/login'); // Uncomment when using react-router
                  alert("Redirecting to login...");
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ChatInterface;
