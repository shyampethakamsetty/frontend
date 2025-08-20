import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/types/graphql';
import { format, isToday, isYesterday, isThisWeek, isThisYear, formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function ChatList({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  onCreateNewChat, 
  onDeleteChat, 
  isMobile = false,
  onClose 
}: ChatListProps) {
  const { logout } = useAuth();

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isToday(dateObj)) {
        // Today: show time only (e.g., "2:30 PM")
        return format(dateObj, 'h:mm a');
      } else if (isYesterday(dateObj)) {
        // Yesterday: show "Yesterday at 2:30 PM"
        return `Yesterday at ${format(dateObj, 'h:mm a')}`;
      } else if (isThisWeek(dateObj)) {
        // This week: show day and time (e.g., "Mon, 2:30 PM")
        return format(dateObj, 'EEE, h:mm a');
      } else if (isThisYear(dateObj)) {
        // This year: show month, day and time (e.g., "Jan 15, 2:30 PM")
        return format(dateObj, 'MMM d, h:mm a');
      } else {
        // Older: show full date and time (e.g., "Dec 15, 2023, 2:30 PM")
        return format(dateObj, 'MMM d, yyyy, h:mm a');
      }
    } catch {
      return 'Unknown';
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`${isMobile ? 'h-full' : 'w-80'} glass-card border-r border-gray-800 flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg lg:text-xl font-bold metallic-text" data-testid="text-conversations">
            Conversations
          </h1>
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 lg:hidden"
              data-testid="close-sidebar-button"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button
          onClick={onCreateNewChat}
          className="w-full shiny-button text-white py-3 rounded-lg font-semibold flex items-center justify-center group"
          data-testid="button-new-chat"
        >
          <i className="fas fa-plus mr-2 group-hover:animate-bounce-soft"></i>
          New Chat
        </Button>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 chat-list">
        {chats.length === 0 ? (
          <div className="text-center py-8" data-testid="text-no-chats">
            <i className="fas fa-comments text-3xl lg:text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400 text-sm lg:text-base">No conversations yet</p>
            <p className="text-gray-500 text-xs lg:text-sm mt-2">Start a new chat to begin</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`glass-card rounded-lg p-3 lg:p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 animate-slide-up group touch-feedback ${
                selectedChat?.id === chat.id ? 'bg-gray-800/50 border-gray-600' : ''
              }`}
              onClick={() => onSelectChat(chat)}
              data-testid={`card-chat-${chat.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-200 truncate group-hover:text-white transition-colors text-sm lg:text-base" data-testid={`text-chat-title-${chat.id}`}>
                    {chat.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                      Created
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(chat.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2" data-testid={`text-chat-date-${chat.id}`}>
                    {formatDate(chat.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300 flex-shrink-0"
                  data-testid={`button-delete-chat-${chat.id}`}
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
