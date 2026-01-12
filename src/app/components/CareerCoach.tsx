import { useState, useRef, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
// Lưu ý: Mình thay ScrollArea bằng div native để xử lý scroll dễ hơn
import { 
  Send, 
  Sparkles, 
  Lightbulb,
  Target,
  MessageSquare,
  Mic
} from 'lucide-react';
import type { Page } from '../App';

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

export function CareerCoach({ onNavigate, onLogout }: CareerCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi A! 👋 I'm your AI Career Coach. I'm here to help you with career guidance, skill recommendations, mock interviews, and creating your personalized career roadmap. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Ref để tự động cuộn
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Help me prepare for a frontend developer interview",
    "What skills should I learn for my dream job?",
    "Create a career roadmap for me",
    "How can I improve my CV?",
    "Practice mock interview questions"
  ];

  // Hàm cuộn xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Gọi scrollToBottom mỗi khi messages thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content?: string) => {
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(messageContent);
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('interview')) {
      return "Great! Let's prepare you for that frontend developer interview. Here are some key areas to focus on:\n\n1. **Technical Skills**\n   - React.js fundamentals and hooks\n   - JavaScript ES6+ features\n   - CSS and responsive design\n   - State management (Redux/Context API)\n\n2. **Common Interview Questions**\n   - What's the virtual DOM and how does it work?\n   - Explain React component lifecycle\n   - Difference between controlled and uncontrolled components\n\n3. **Coding Challenges**\n   - Practice building small components\n   - Solve algorithm problems on LeetCode\n\nWould you like me to conduct a mock interview with you?";
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      return "Based on your profile and current market trends, here are the skills I recommend:\n\n**High Priority:**\n1. TypeScript - Increasingly required for frontend roles\n2. Next.js - Popular React framework\n3. Testing (Jest, React Testing Library)\n\n**Medium Priority:**\n4. Node.js basics for full-stack capabilities\n5. GraphQL for modern APIs\n6. Docker for containerization\n\n**Soft Skills:**\n7. Agile/Scrum methodologies\n8. Communication and teamwork\n\nI can create a detailed learning roadmap for any of these. Which would you like to focus on first?";
    }
    
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('career')) {
      return "I'll create a personalized 6-month career roadmap for you:\n\n**Month 1-2: Foundation Strengthening**\n- Complete Advanced React course\n- Build 2 portfolio projects\n- Contribute to open-source\n\n**Month 3-4: Skill Expansion**\n- Learn TypeScript\n- Master testing frameworks\n- Complete system design basics\n\n**Month 5-6: Job Search & Interview**\n- Polish CV and portfolio\n- Apply to 20+ companies\n- Practice mock interviews weekly\n- Network on LinkedIn\n\n**Goal:** Land a Frontend Developer role at a tech company\n\nWould you like me to break down any of these phases in more detail?";
    }
    
    if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return "I can help improve your CV! Here are my top recommendations:\n\n1. **Add Quantifiable Achievements**\n   - Instead of: 'Worked on React projects'\n   - Try: 'Built 3 React applications serving 10K+ users'\n\n2. **Optimize Keywords**\n   - Include: React, TypeScript, JavaScript, CSS, Git\n   - Match job description keywords\n\n3. **Structure Improvements**\n   - Professional summary at the top\n   - Projects section with live links\n   - Clear skills categorization\n\nWould you like me to review your current CV and provide specific feedback?";
    }
    
    if (lowerMessage.includes('mock')) {
      return "Let's start a mock interview! I'll ask you some common frontend developer questions:\n\n**Question 1:** Can you explain what React Hooks are and why they were introduced?\n\nTake your time to answer, and I'll provide feedback on your response. You can also say 'skip' to move to the next question or 'end' to finish the interview.";
    }
    
    return "That's a great question! Based on your career goals and current skill level, I recommend focusing on:\n\n1. **Immediate Actions**\n   - Update your CV with recent projects\n   - Complete the React advanced course you started\n   - Build a portfolio website\n\n2. **This Week**\n   - Apply to 5 suitable job openings\n   - Practice coding challenges daily\n   - Connect with 10 people on LinkedIn\n\n3. **This Month**\n   - Attend tech meetups or webinars\n   - Contribute to open-source projects\n   - Prepare for technical interviews\n\nIs there anything specific you'd like to discuss in more detail?";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentPage="career-coach" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 text-gray-900 font-bold">Career Coach AI</h1>
          <p className="text-gray-600">Get personalized career guidance powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {/* SỬA LỖI 1: overflow-hidden để chặn tràn ra ngoài khung Card */}
            <Card className="h-[calc(100vh-250px)] flex flex-col overflow-hidden shadow-md border-0 ring-1 ring-gray-200">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white shrink-0 z-10">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Career Coach</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Online
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              {/* SỬA LỖI 2: min-h-0 và overflow-y-auto để scroll hoạt động đúng */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 min-h-0 custom-scrollbar">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                          message.type === 'user'
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
                        
                        {/* SỬA LỖI 3: whitespace-pre-wrap và break-words để text không bị tràn */}
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
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium ml-2">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Div vô hình để làm điểm neo scroll */}
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={() => handleSendMessage()} 
                      disabled={!inputMessage.trim()} 
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          {/* SỬA LỖI 4: Giới hạn chiều cao Sidebar và cho phép scroll nội bộ */}
          <div className="space-y-4 lg:h-[calc(100vh-250px)] lg:overflow-y-auto pr-1 custom-scrollbar">
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
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className={`p-1.5 rounded-md ${topic.bg}`}>
                        <Icon className={`w-4 h-4 ${topic.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{topic.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Your Goals */}
            <Card className="p-4 shadow-sm border-gray-200">
              <h3 className="mb-4 font-semibold text-gray-900">Current Context</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Target Role</div>
                  <div className="text-sm font-medium text-gray-900">Frontend Developer</div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                    <div className="text-xs font-semibold text-purple-800 uppercase tracking-wide mb-1">Timeline</div>
                    <div className="text-sm font-medium text-gray-900">3-6 mths</div>
                  </div>
                  <div className="flex-1 p-3 bg-green-50/50 rounded-lg border border-green-100">
                      <div className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Focus</div>
                      <div className="text-sm font-medium text-gray-900">React</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommended Actions */}
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