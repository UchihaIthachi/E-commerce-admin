import { GraphQLClient } from "graphql-request";

const graphqlEndpoint = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-08-01/graphql/${process.env.NEXT_PUBLIC_SANITY_DATASET}/default`;

export const graphqlClient = new GraphQLClient(graphqlEndpoint, {
  headers: {
    Authorization: `Bearer ${process.env.SANITY_TOKEN}`,
  },
});
