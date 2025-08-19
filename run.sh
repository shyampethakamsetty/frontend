#!/bin/bash
# Test basic subscription support
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{
    "query": "subscription { __typename }"
  }' \
  "YOUR_GRAPHQL_URL"