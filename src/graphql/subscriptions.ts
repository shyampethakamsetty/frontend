import { gql } from '@apollo/client';

export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      message
      sender
      created_at
      chat_id
    }
  }
`; 