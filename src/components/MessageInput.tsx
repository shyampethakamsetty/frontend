import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { SEND_MESSAGE, UPDATE_CHAT } from '@/graphql/mutations';
import { GET_MESSAGES } from '@/graphql/queries';
import type { Message } from '@/types/graphql';
import { GET_CHATS } from '@/graphql/queries';

interface MessageInputProps {
  chat_id: string;
  onMessageSent: () => void;
  disabled?: boolean;
  placeholder?: string;
  isMobile?: boolean;
  isFirstMessage?: boolean;
  onTitleUpdate?: (title: string) => void;
}

export default function MessageInput({ 
  chat_id, 
  onMessageSent, 
  disabled = false, 
  placeholder = "Type your message...", 
  isMobile = false,
  isFirstMessage = false,
  onTitleUpdate
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      // Message sent successfully - optimistic update already handled
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const [updateChat] = useMutation(UPDATE_CHAT, {
    onCompleted: (data) => {
      // Chat title updated successfully
      if (onTitleUpdate && data?.update_chats_by_pk?.title) {
        onTitleUpdate(data.update_chats_by_pk.title);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update chat title: ${error.message}`,
        variant: 'destructive',
      });
    },
    update: (cache, { data }) => {
      // Update the chat in the chat list cache
      try {
        const chatId = data?.update_chats_by_pk?.id;
        const newTitle = data?.update_chats_by_pk?.title;
        
        if (chatId && newTitle) {
          const existingChats = cache.readQuery<{ chats: any[] }>({
            query: GET_CHATS,
          });

          if (existingChats?.chats) {
            const updatedChats = existingChats.chats.map(chat => 
              chat.id === chatId ? { ...chat, title: newTitle } : chat
            );

            cache.writeQuery({
              query: GET_CHATS,
              data: { chats: updatedChats },
            });
          }
        }
      } catch (error) {
        console.warn('Cache update error for chat list:', error);
      }
    },
  });

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;

    const messageText = message.trim();
    
    // If no chat_id is provided, we can't send a message
    if (!chat_id) {
      toast({
        title: 'No Chat Selected',
        description: 'Please select a chat or create a new one to send messages',
        variant: 'destructive',
      });
      return;
    }

    // Clear message immediately for instant feedback
    setMessage('');
    
    // Show typing indicator immediately when user sends message
    onMessageSent();
    
    // Add instant visual feedback
    const button = e.currentTarget.querySelector('button[type="submit"]');
    if (button) {
      button.classList.add('bg-green-500');
      setTimeout(() => button.classList.remove('bg-green-500'), 200);
    }

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();
    const optimisticMessage: Message = {
      id: tempId,
      message: messageText,
      sender: 'user',
      created_at: now,
      chat_id: chat_id,
    };
    
    // Send message with optimistic update
    sendMessage({
      variables: {
        chat_id: chat_id,
        message: messageText,
      },
      optimisticResponse: {
        sendMessage: optimisticMessage,
      },
      update: (cache, { data }) => {
        // Add optimistic message immediately
        try {
          const existingMessages = cache.readQuery<{ messages: Message[] }>({
            query: GET_MESSAGES,
            variables: { chat_id },
          });

          if (existingMessages?.messages) {
            // Check if this is the real response (not optimistic)
            const newMessage = data?.sendMessage || optimisticMessage;
            
            // Avoid duplicates by checking if message already exists
            const messageExists = existingMessages.messages.some(
              msg => msg.id === newMessage.id || (msg.message === newMessage.message && msg.sender === newMessage.sender)
            );

            if (!messageExists) {
              cache.writeQuery({
                query: GET_MESSAGES,
                variables: { chat_id },
                data: {
                  messages: [...existingMessages.messages, newMessage],
                },
              });
            }
          }
        } catch (error) {
          // Silently handle cache errors
          console.warn('Cache update error:', error);
        }
      },
    }).then(() => {
      // Update chat title if this is the first message
      if (isFirstMessage && onTitleUpdate) {
        // Truncate message to reasonable title length (max 50 chars)
        const title = messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText;
        updateChat({
          variables: {
            id: chat_id,
            title: title
          }
        });
      }
    }).catch(() => {
      // Only restore message on error
      setMessage(messageText);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`message-input-container ${isMobile ? 'p-3' : 'p-6'}`}>
      <form className="flex items-end space-x-2 lg:space-x-4" onSubmit={handleSubmit}>
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-textarea w-full px-3 lg:px-4 py-3 lg:py-4 rounded-lg focus:outline-none resize-none min-h-[48px] lg:min-h-[52px] max-h-[120px] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
            disabled={disabled}
            data-testid="textarea-message-input"
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled || !chat_id}
          className="send-button px-4 lg:px-6 py-3 lg:py-4 rounded-lg flex items-center justify-center group min-h-[48px] lg:min-h-[52px] hover:scale-105 active:scale-95 transition-all duration-150"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </form>
      <div className="mt-2 lg:mt-3 flex items-center justify-center text-xs text-muted-foreground px-2">
        <i className="fas fa-info-circle mr-1"></i>
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
