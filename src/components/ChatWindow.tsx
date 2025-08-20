import { useState, useEffect, useRef } from 'react';
import MessageInput from '@/components/MessageInput';
import { MessageBubble } from '@/components/MessageBubble';
import type { Chat, Message } from '@/types/graphql';

import { Bot, User, MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  selectedChat: Chat | null;
  messages: Message[];
  onMessageSent: () => void;
  onTitleUpdate?: (title: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  isMobile?: boolean;
}

export default function ChatWindow({ 
  selectedChat, 
  messages, 
  onMessageSent, 
  onTitleUpdate,
  isLoading = false,
  isTyping = false,
  isMobile = false
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleMessageSent = () => {
    onMessageSent();
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col min-h-0 chat-window">
        {/* Welcome Message */}
        <div className="messages-container flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md w-full" data-testid="text-welcome-message">
            <div className="robot-icon mx-auto w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mb-4 lg:mb-6">
              <i className="fas fa-robot text-black text-xl lg:text-2xl"></i>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 lg:mb-4">Chat with AI</h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-4 lg:mb-6 px-4">
              Start a conversation with our AI assistant. Ask questions, get help, or just chat!
            </p>
          </div>
        </div>
        
        {/* Always Show Message Input at Bottom */}
        <div className="message-input-wrapper">
          <div className="p-3 lg:p-4 bg-muted/20">
            <p className="text-xs lg:text-sm text-muted-foreground text-center mb-3">
              💬 <strong>Ready to chat?</strong> Select a conversation from the sidebar or create a new one
            </p>
          </div>
          <MessageInput
            chat_id=""
            onMessageSent={() => {
              // If no chat is selected, this will create a new chat
            }}
            disabled={false}
            placeholder="Select a chat to start messaging..."
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 chat-window">
      {/* Simplified Chat Header */}
      <div className="chat-header p-3 lg:p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base lg:text-xl font-semibold text-foreground truncate" data-testid="text-chat-title">
              {selectedChat.title}
            </h2>
            <p className="text-xs lg:text-sm text-muted-foreground" data-testid="text-message-count">
              {messages.length} messages
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="online-indicator w-2 h-2"></div>
            <span className="text-xs lg:text-sm text-muted-foreground">AI Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container p-3 lg:p-6 space-y-4 lg:space-y-6" data-testid="messages-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4" data-testid="text-no-messages">
              <div className="robot-icon mx-auto w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mb-3 lg:mb-4">
                <i className="fas fa-robot text-black text-base lg:text-lg"></i>
              </div>
              <p className="text-foreground text-base lg:text-lg mb-2">Start the conversation</p>
              <p className="text-muted-foreground text-sm lg:text-base">Send a message to begin chatting with AI</p>
            </div>
          </div>
        ) : (
          messages.map((message: Message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender === 'user'}
              isMobile={isMobile}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200" data-testid="typing-indicator">
            <div className="max-w-2xl w-full">
              <div className="flex items-center mb-3 space-x-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground animate-pulse" />
                </div>
                <span className="text-xs lg:text-sm font-medium text-muted-foreground">AI Assistant</span>
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-md p-3 lg:p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs lg:text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Always at bottom */}
      <div className="message-input-wrapper">
        <MessageInput
          chat_id={selectedChat.id}
          onMessageSent={handleMessageSent}
          onTitleUpdate={onTitleUpdate}
          isFirstMessage={messages.length === 0}
          disabled={isLoading}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
