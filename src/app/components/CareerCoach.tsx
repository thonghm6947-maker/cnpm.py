import { useState, useRef, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Send,
  Sparkles,
  Lightbulb,
  Target,
  MessageSquare,
  Mic,
  Loader2,
  Trash2,
  Plus,
  History,
  AlertCircle
} from 'lucide-react';
import type { Page } from '../App';
import { aiAPI } from '../../services/api';

interface CareerCoachProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  session_id: number;
  topic: string;
  created_at: string;
  updated_at: string;
}

export function CareerCoach({ onNavigate, onLogout }: CareerCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! 👋 I'm your AI Career Coach powered by Google Gemini. I'm here to help you with career guidance, skill recommendations, interview prep, and creating your personalized career roadmap. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Help me prepare for a frontend developer interview",
    "What skills should I learn for my dream job?",
    "Create a career roadmap for me",
    "How can I improve my CV?",
    "Practice mock interview questions"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await aiAPI.getChatSessions();
      if (response.success) {
        setSessions(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSessionMessages = async (session: ChatSession) => {
    setIsTyping(true);
    setError(null);
    try {
      const response = await aiAPI.getSessionMessages(session.session_id);
      if (response.success) {
        const loadedMessages: Message[] = response.data.messages.map((msg: any, index: number) => ({
          id: index + 1,
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        setSessionId(session.session_id);
      }
    } catch (err) {
      setError('Failed to load session messages');
      console.error('Load session error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const deleteSession = async (session_id: number) => {
    try {
      const response = await aiAPI.deleteSession(session_id);
      if (response.success) {
        setSessions(prev => prev.filter(s => s.session_id !== session_id));
        if (sessionId === session_id) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([{
      id: 1,
      type: 'ai',
      content: "Hi! 👋 I'm your AI Career Coach. How can I help you today?",
      timestamp: new Date()
    }]);
    setError(null);
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await aiAPI.sendMessage(
        messageContent,
        sessionId,
        sessionId ? null : 'Career Coaching'
      );

      if (response.success) {
        const aiMessage: Message = {
          id: messages.length + 2,
          type: 'ai',
          content: typeof response.data.ai_response === 'object'
            ? response.data.ai_response.content
            : response.data.ai_response,
          timestamp: new Date(response.data.created_at)
        };
        setMessages(prev => [...prev, aiMessage]);

        // Store session ID for subsequent messages
        if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
          loadChatSessions(); // Refresh sessions list
        }
      } else {
        setError(response.message || 'Failed to get AI response');
        // Add error message to chat
        const errorMessage: Message = {
          id: messages.length + 2,
          type: 'ai',
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "Sorry, I couldn't connect to the server. Please check your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Send message error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentPage="career-coach" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 text-gray-900 font-bold">Career Coach AI</h1>
          <p className="text-gray-600">Get personalized career guidance powered by Google Gemini</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-900">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-250px)] flex flex-col overflow-hidden shadow-md border-0 ring-1 ring-gray-200">

              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white shrink-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Career Coach</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {isTyping ? 'Thinking...' : 'Online'}
                      </div>
                    </div>
                  </div>
                  {sessionId && (
                    <Badge variant="secondary" className="text-xs">
                      Session #{sessionId}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 min-h-0 custom-scrollbar">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                          }`}
                      >
                        {message.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold uppercase tracking-wide">AI Coach</span>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.content}
                        </div>

                        <div className={`text-[10px] mt-2 text-right ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          <span className="text-xs text-gray-500 font-medium">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Prompts & Input Area */}
              <div className="bg-white border-t border-gray-200 shrink-0 z-10">
                {messages.length <= 1 && (
                  <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Suggested Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(prompt)}
                          disabled={isTyping}
                          className="text-xs bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors h-auto py-1.5"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message here..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                      disabled={isTyping}
                      className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isTyping}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:h-[calc(100vh-250px)] lg:overflow-y-auto pr-1 custom-scrollbar">
            {/* New Chat Button */}
            <Button
              onClick={startNewChat}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>

            {/* Chat History */}
            <Card className="p-4 shadow-sm border-gray-200">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <History className="w-4 h-4 text-blue-600" />
                Chat History
              </h3>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.session_id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${sessionId === session.session_id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      onClick={() => loadSessionMessages(session)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {session.topic || 'Chat Session'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.session_id);
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No previous chats</p>
              )}
            </Card>

            {/* Conversation Topics */}
            <Card className="p-4 shadow-sm border-gray-200">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Topics
              </h3>
              <div className="space-y-1">
                {[
                  { icon: Target, label: 'Career Planning', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Lightbulb, label: 'Skill Recommendations', color: 'text-purple-600', bg: 'bg-purple-50' },
                  { icon: MessageSquare, label: 'Mock Interviews', color: 'text-green-600', bg: 'bg-green-50' },
                  { icon: Sparkles, label: 'CV Feedback', color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleSendMessage(`Tell me about ${topic.label.toLowerCase()}`)}
                    >
                      <div className={`p-1.5 rounded-md ${topic.bg}`}>
                        <Icon className={`w-4 h-4 ${topic.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{topic.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 shadow-sm border-gray-200">
              <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  onClick={() => onNavigate('cv-analyzer')}
                >
                  <Target className="w-4 h-4 text-blue-600" />
                  Analyze CV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  onClick={() => onNavigate('jobs')}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Find Jobs
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  onClick={() => onNavigate('learning')}
                >
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Learn Skills
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}