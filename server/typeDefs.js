export const typeDefs = `#graphql
type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
}

type Mutation {
    login(email: String!, password: String!): User!
}

`;