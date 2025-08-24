import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_CHATS, GET_MESSAGES } from '@/graphql/queries';
import { CREATE_CHAT, DELETE_CHAT } from '@/graphql/mutations';
import { MESSAGES_SUBSCRIPTION } from '@/graphql/subscriptions';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Navbar from '@/components/Navbar';
import type { Chat, Message } from '@/types/graphql';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Close sidebar when chat is selected on mobile
  useEffect(() => {
    if (isMobile && selectedChat) {
      setIsSidebarOpen(false);
    }
  }, [selectedChat, isMobile]);


  // Query chats
  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery(GET_CHATS, {
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to load chats: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Query messages for selected chat
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(
    GET_MESSAGES,
    {
      variables: { chat_id: selectedChat?.id || '' },
      skip: !selectedChat?.id,
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to load messages: ' + error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Create chat mutation
  const [createChat, { loading: createChatLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      const newChat = data.insert_chats_one;
      setSelectedChat(newChat);
      refetchChats();
      toast({
        title: 'Success',
        description: 'New chat created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create chat: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete chat mutation
  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      if (selectedChat) {
        setSelectedChat(null);
      }
      refetchChats();
      toast({
        title: 'Success',
        description: 'Chat deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete chat: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Subscribe to messages for selected chat
  useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chat_id: selectedChat?.id || '' },
    skip: !selectedChat?.id,
    onData: ({ data }) => {
      if (data?.data?.messages) {
        // Check if the latest message is from AI (not user)
        const latestMessage = data.data.messages[data.data.messages.length - 1];
        
        if (latestMessage && latestMessage.sender === 'bot') {
          // Hide typing indicator immediately when AI responds
          setIsTyping(false);
        }
        
        // Refetch messages after handling typing state
        refetchMessages();
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      // Hide typing indicator on error
      setIsTyping(false);
    },
  });

  // Select first chat when chats are loaded
  useEffect(() => {
    if (chatsData?.chats && chatsData.chats.length > 0 && !selectedChat) {
      setSelectedChat(chatsData.chats[0]);
    }
  }, [chatsData?.chats, selectedChat]);

  // Hide typing indicator when bot message appears in messages
  useEffect(() => {
    if (messagesData?.messages && messagesData.messages.length > 0) {
      const latestMessage = messagesData.messages[messagesData.messages.length - 1];
      if (latestMessage && latestMessage.sender === 'bot' && isTyping) {
        setIsTyping(false);
      }
    }
  }, [messagesData?.messages, isTyping]);

  // Clear typing indicator when switching chats
  useEffect(() => {
    setIsTyping(false);
  }, [selectedChat?.id]);

  // Clear typing indicator when component unmounts
  useEffect(() => {
    return () => {
      setIsTyping(false);
    };
  }, []);

  const handleCreateNewChat = async () => {
    try {
      await createChat({
        variables: { title: 'New Conversation' },
      });
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat({
        variables: { id: chatId },
      });
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleMessageSent = () => {
    // Show typing indicator immediately when user sends message
    setIsTyping(true);
    
    // Fallback: hide typing indicator after 30 seconds if no AI response
    // This prevents the indicator from getting stuck
    setTimeout(() => {
      setIsTyping(false);
    }, 30000);
  };

  const handleTitleUpdate = (newTitle: string) => {
    // Update the selected chat title in local state
    if (selectedChat) {
      setSelectedChat({
        ...selectedChat,
        title: newTitle
      });
    }
    
    // Refetch chats to update the list
    refetchChats();
  };

  if (chatsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-foreground font-medium">Loading chats...</span>
        </div>
      </div>
    );
  }

  const chats = chatsData?.chats || [];
  const messages = messagesData?.messages || [];

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar 
        currentChatTitle={selectedChat?.title} 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Chat List - Mobile Sidebar */}
        <div className={`
          ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out' : 'relative'}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile ? 'w-80' : 'w-80 max-w-[85vw]'}
        `}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onCreateNewChat={handleCreateNewChat}
            onDeleteChat={handleDeleteChat}
            isMobile={isMobile}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        
        {/* Chat Window */}
        <div className={`flex-1 ${!isMobile ? 'ml-0' : ''}`}>
          <ChatWindow
            selectedChat={selectedChat}
            messages={messages}
            onMessageSent={handleMessageSent}
            isLoading={messagesLoading || createChatLoading}
            isTyping={isTyping}
            isMobile={isMobile}
            onTitleUpdate={handleTitleUpdate}
          />
        </div>
      </div>
    </div>
  );
}
