import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/types/graphql';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChat, onSelectChat, onCreateNewChat, onDeleteChat }: ChatListProps) {
  const { logout } = useAuth();

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="w-80 glass-card border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold metallic-text" data-testid="text-conversations">
            Conversations
          </h1>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chats.length === 0 ? (
          <div className="text-center py-8" data-testid="text-no-chats">
            <i className="fas fa-comments text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No conversations yet</p>
            <p className="text-gray-500 text-sm mt-2">Start a new chat to begin</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`glass-card rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 animate-slide-up group ${
                selectedChat?.id === chat.id ? 'bg-gray-800/50 border-gray-600' : ''
              }`}
              onClick={() => onSelectChat(chat)}
              data-testid={`card-chat-${chat.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-200 truncate group-hover:text-white transition-colors" data-testid={`text-chat-title-${chat.id}`}>
                    {chat.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate mt-1" data-testid={`text-chat-preview-${chat.id}`}>
                    {/* Show creation date as preview since we don't have last message */}
                    Created {formatDate(chat.created_at)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2" data-testid={`text-chat-date-${chat.id}`}>
                    {formatDate(chat.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
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
