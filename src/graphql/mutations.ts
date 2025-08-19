import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      user_id
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($id: uuid!) {
    delete_chats(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      id
      message
      sender
      created_at
      chat_id
    }
  }
`; 