import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import { SEND_MESSAGE } from '@/graphql/mutations';
import type { Message } from '@/types/graphql';

interface MessageInputProps {
  chat_id: string;
  onMessageSent: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ chat_id, onMessageSent, disabled = false, placeholder = "Type your message..." }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const [sendMessage, { loading: isSending }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      onMessageSent();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
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
    
    if (!message.trim() || isSending || disabled) return;

    const messageText = message.trim();
    setMessage('');

    try {
      // If no chat_id is provided, we can't send a message
      if (!chat_id) {
        toast({
          title: 'No Chat Selected',
          description: 'Please select a chat or create a new one to send messages',
          variant: 'destructive',
        });
        return;
      }

      await sendMessage({
        variables: {
          chat_id: chat_id,
          message: messageText,
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      setMessage(messageText); // Restore message on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container p-6">
      <form className="flex items-end space-x-4" onSubmit={handleSubmit}>
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-textarea w-full px-4 py-3 rounded-lg focus:outline-none resize-none min-h-[52px] max-h-[120px] text-white"
            placeholder={placeholder}
            disabled={isSending || disabled}
            data-testid="textarea-message-input"
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isSending || disabled || !chat_id}
          className="send-button px-6 py-4 rounded-lg flex items-center justify-center group min-h-[52px]"
          data-testid="button-send-message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      <div className="mt-3 flex items-center justify-center text-xs text-muted-foreground">
        <i className="fas fa-info-circle mr-1"></i>
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
