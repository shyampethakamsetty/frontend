import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { NhostClient } from '@nhost/nhost-js';

// Validate environment variables
const requiredEnvVars = {
  VITE_NHOST_AUTH_URL: import.meta.env.VITE_NHOST_AUTH_URL,
  VITE_NHOST_GRAPHQL_URL: import.meta.env.VITE_NHOST_GRAPHQL_URL,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file and ensure all required variables are set.'
  );
}

// Log WebSocket configuration
console.log('GraphQL URL:', requiredEnvVars.VITE_NHOST_GRAPHQL_URL);
console.log('WebSocket URL:', requiredEnvVars.VITE_NHOST_GRAPHQL_URL!.replace('http', 'ws').replace('https', 'wss'));

// Create Nhost client with proper configuration
export const nhost = new NhostClient({
  authUrl: requiredEnvVars.VITE_NHOST_AUTH_URL!,
  graphqlUrl: requiredEnvVars.VITE_NHOST_GRAPHQL_URL!,
  storageUrl: requiredEnvVars.VITE_NHOST_GRAPHQL_URL!.replace('/graphql', '/storage'),
  functionsUrl: requiredEnvVars.VITE_NHOST_GRAPHQL_URL!.replace('/graphql', '/functions'),
  // Production-grade configuration
  autoRefreshToken: true,
  autoSignIn: false,
  clientStorageType: 'localStorage',
  refreshIntervalTime: 10 * 60 * 1000, // 10 minutes
});

// HTTP link for GraphQL operations
const httpLink = createHttpLink({
  uri: requiredEnvVars.VITE_NHOST_GRAPHQL_URL!,
  credentials: 'include',
});

// WebSocket link for GraphQL subscriptions
const wsUrl = requiredEnvVars.VITE_NHOST_GRAPHQL_URL!.replace('/v1', '/v1/graphql').replace('https', 'wss');

// Only create WebSocket link if we have a valid WebSocket URL
let wsLink: GraphQLWsLink | null = null;
let splitLink: any = httpLink;

try {
  wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      connectionParams: () => ({
        headers: {
          Authorization: `Bearer ${nhost.auth.getAccessToken()}`,
        },
      }),
      retryAttempts: 3,
      retryWait: (retryCount) => new Promise(resolve => 
        setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000))
      ),
      on: {
        connected: () => console.log('WebSocket connected for subscriptions'),
        closed: () => console.log('WebSocket closed'),
        error: (error) => console.error('WebSocket error:', error),
      },
    })
  );

  // Split links: HTTP for queries/mutations, WebSocket for subscriptions
  splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );
} catch (error) {
  console.warn('Failed to create WebSocket link, subscriptions will not work:', error);
  // Fallback to HTTP-only if WebSocket fails
  splitLink = httpLink;
}

// Auth link to add authentication headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = nhost.auth.getAccessToken();
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    };
      } catch (error) {
    console.warn('Failed to get auth token:', error);
    return { headers };
  }
});

// Error link for handling GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('User is not authenticated, redirecting to login...');
        // You can add navigation logic here if needed
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle network errors gracefully
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      console.warn('Unauthorized request, user may need to re-authenticate');
    }
  }
});

// Create Apollo Client with production-grade configuration
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge: false, // Don't merge, replace completely
          },
          messages: {
            merge: false, // Don't merge, replace completely
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Production-grade settings
  connectToDevTools: import.meta.env.DEV,
  assumeImmutableResults: true,
});
