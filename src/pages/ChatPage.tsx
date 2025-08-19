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
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { toast } = useToast();



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
        refetchMessages();
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });

  // Select first chat when chats are loaded
  useEffect(() => {
    if (chatsData?.chats && chatsData.chats.length > 0 && !selectedChat) {
      setSelectedChat(chatsData.chats[0]);
    }
  }, [chatsData?.chats, selectedChat]);

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
    // Messages will be updated via subscription
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
      <Navbar currentChatTitle={selectedChat?.title} />
      <div className="flex-1 flex overflow-hidden">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onDeleteChat={handleDeleteChat}
        />
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          onMessageSent={handleMessageSent}
          isLoading={messagesLoading || createChatLoading}
        />
      </div>
    </div>
  );
}
