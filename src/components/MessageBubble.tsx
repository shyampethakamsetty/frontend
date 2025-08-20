import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '@/types/graphql';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isMobile?: boolean;
}

export function MessageBubble({ message, isOwnMessage, isMobile = false }: MessageBubbleProps) {
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
      <div className={`${isMobile ? 'max-w-full' : 'max-w-2xl'} ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center mb-2 lg:mb-3 space-x-2">
          <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center flex-shrink-0 ${
            isOwnMessage ? 'user-avatar' : 'bg-muted'
          }`}>
            {isOwnMessage ? (
              <i className={`fas fa-user text-black ${isMobile ? 'text-xs' : 'text-sm'}`}></i>
            ) : (
              <i className={`fas fa-robot text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}></i>
            )}
          </div>
          <span className={`font-medium text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isOwnMessage ? 'You' : 'AI Assistant'}
          </span>
        </div>
        <div className={`rounded-2xl ${isMobile ? 'p-3' : 'p-4'} relative ${
          isOwnMessage 
            ? 'message-bubble-user rounded-br-md' 
            : 'message-bubble-bot rounded-bl-md'
        }`}>
          <p className={`leading-relaxed ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {message.message}
          </p>
        </div>
        <p className={`text-muted-foreground mt-2 ${isMobile ? 'ml-8 text-xs' : 'ml-12 text-xs'}`}>
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
} 