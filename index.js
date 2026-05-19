import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import cors from 'cors'

import { users, posts, comments } from './db.js'

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    avatar: String
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    body: String
    userId: ID!
    likes: Int
    createdAt: String
    user: User
    comments: [Comment]
  }

  type Comment {
    id: ID!
    body: String
    postId: ID!
    userId: ID!
    user: User
  }

  type Query {
    users: [User]
    posts(limit: Int): [Post]
    post(id: ID!): Post
  }

  type Mutation {
    likePost(id: ID!): Post
  }`


const resolvers = {
    Query: {
        users: () => users,
        posts: (_, { limit }) => limit ? posts.slice(0, limit) : posts,
        post: (_, { id }) => posts.find(p => p.id === id)
    },

    Mutation: {
        likePost: (_, { id }) => {
            const post = posts.find(p => p.id === id)
            post.likes += 1
            return post
        }
    },

    Post: {
        user: (post) => users.find(u => u.id === post.userId),
        comments: (post) => comments.filter(c => c.postId === post.id)
    },

    Comment: {
        user: (comment) => users.find(u => u.id === comment.userId)
    },

    User: {
        posts: (user) => posts.filter(p => p.userId === user.id)
    }
}

const app = express()

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

app.use('/graphql', cors(), express.json(), expressMiddleware(server))

app.listen(4001, () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql')
})