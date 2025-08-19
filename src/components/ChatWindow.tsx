import { useState, useEffect, useRef } from 'react';
import MessageInput from '@/components/MessageInput';
import { MessageBubble } from '@/components/MessageBubble';
import type { Chat, Message } from '@/types/graphql';
import { formatDistanceToNow } from 'date-fns';
import { Bot, User, MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  selectedChat: Chat | null;
  messages: Message[];
  onMessageSent: () => void;
  isLoading?: boolean;
}

export default function ChatWindow({ 
  selectedChat, 
  messages, 
  onMessageSent, 
  isLoading = false 
}: ChatWindowProps) {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleMessageSent = () => {
    setIsTyping(true);
    onMessageSent();
    
    // Hide typing indicator after AI response (simulated)
    setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Welcome Message */}
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center max-w-md" data-testid="text-welcome-message">
            <div className="robot-icon mx-auto w-16 h-16 flex items-center justify-center mb-6">
              <i className="fas fa-robot text-black text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Chat with AI</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Start a conversation with our AI assistant. Ask questions, get help, or just chat!
            </p>
          </div>
        </div>
        
        {/* Always Show Message Input */}
        <div className="border-t border-gray-800">
          <div className="p-4 bg-muted/20">
            <p className="text-sm text-muted-foreground text-center mb-3">
              💬 <strong>Ready to chat?</strong> Select a conversation from the sidebar or create a new one
            </p>
          </div>
          <MessageInput
            chat_id=""
            onMessageSent={() => {
              // If no chat is selected, this will create a new chat
              console.log('Message sent without chat selection');
            }}
            disabled={false}
            placeholder="Select a chat to start messaging..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Simplified Chat Header */}
      <div className="chat-header p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground" data-testid="text-chat-title">
              {selectedChat.title}
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="text-message-count">
              {messages.length} messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="online-indicator w-2 h-2"></div>
            <span className="text-sm text-muted-foreground">AI Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="messages-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" data-testid="text-no-messages">
              <div className="robot-icon mx-auto w-12 h-12 flex items-center justify-center mb-4">
                <i className="fas fa-robot text-black text-lg"></i>
              </div>
              <p className="text-foreground text-lg mb-2">Start the conversation</p>
              <p className="text-muted-foreground">Send a message to begin chatting with AI</p>
            </div>
          </div>
        ) : (
          messages.map((message: Message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender === 'user'}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2" data-testid="typing-indicator">
            <div className="max-w-2xl">
              <div className="flex items-center mb-3 space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground animate-pulse" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">AI Assistant</span>
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-md p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        chat_id={selectedChat.id}
        onMessageSent={handleMessageSent}
        disabled={isLoading}
      />
    </div>
  );
}
