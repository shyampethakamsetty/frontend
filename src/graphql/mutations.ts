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

export const UPDATE_CHAT = gql`
  mutation UpdateChat($id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $id }, _set: { title: $title }) {
      id
      title
      created_at
      user_id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: uuid!, $displayName: String!) {
    updateUser(pk_columns: { id: $id }, _set: { displayName: $displayName }) {
      id
      displayName
      email
      createdAt
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