import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '@/types/graphql';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isToday(dateObj)) {
        // Today: show time only (e.g., "2:30 PM")
        return format(dateObj, 'h:mm a');
      } else if (isYesterday(dateObj)) {
        // Yesterday: show "Yesterday at 2:30 PM"
        return `Yesterday at ${format(dateObj, 'h:mm a')}`;
      } else {
        // Older: show date and time (e.g., "Jan 15, 2:30 PM")
        return format(dateObj, 'MMM d, h:mm a');
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center mb-3 space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOwnMessage ? 'user-avatar' : 'bg-muted'
          }`}>
            {isOwnMessage ? (
              <i className="fas fa-user text-black text-sm"></i>
            ) : (
              <i className="fas fa-robot text-muted-foreground text-sm"></i>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {isOwnMessage ? 'You' : 'AI Assistant'}
          </span>
        </div>
        <div className={`rounded-2xl p-4 relative ${
          isOwnMessage 
            ? 'message-bubble-user rounded-br-md' 
            : 'message-bubble-bot rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed">
            {message.message}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2 ml-12">
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
} 