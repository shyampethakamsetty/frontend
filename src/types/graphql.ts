export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  created_at: string;
  chat_id: string;
}

export interface CreateChatInput {
  title: string;
}

export interface SendMessageInput {
  chat_id: string;
  message: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface GetChatsResponse {
  chats: Chat[];
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface CreateChatResponse {
  insert_chats_one: Chat;
}

export interface SendMessageResponse {
  sendMessage: Message;
} 