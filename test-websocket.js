// test-subscription.js
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

const client = createClient({
  url: 'wss://nkbjxeinozigcsykcfsk.graphql.ap-south-1.nhost.run/v1/graphql',
  webSocketImpl: WebSocket,
  connectionParams: {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU2NDY3OTgsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIiwibWUiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiIxYzlmODAxZi1kNmJlLTQ2OTAtODIzMy0zYjYwODQ0NWFjN2UiLCJ4LWhhc3VyYS11c2VyLWlzLWFub255bW91cyI6ImZhbHNlIn0sImlhdCI6MTc1NTY0NTg5OCwiaXNzIjoiaGFzdXJhLWF1dGgiLCJzdWIiOiIxYzlmODAxZi1kNmJlLTQ2OTAtODIzMy0zYjYwODQ0NWFjN2UifQ.VYzFHk3KOLjZXGobjGi_5H1gedWkBpFHczWTMaqcI0g',
    },
  },
});

(async () => {
  console.log('🔌 Connecting to Nhost subscription...');

  const onNext = (data) => {
    console.log('📡 Data received:', JSON.stringify(data, null, 2));
  };

  await new Promise((resolve, reject) => {
    client.subscribe(
      {
        query: `
          subscription {
            chats {
              id
              title
              created_at
            }
          }
        `,
      },
      {
        next: onNext,
        error: (err) => {
          console.error('❌ Subscription error:', err);
          reject(err);
        },
        complete: () => {
          console.log('✅ Subscription complete');
          resolve();
        },
      }
    );
  });
})();
