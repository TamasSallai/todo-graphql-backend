import * as dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import gql from 'graphql-tag'
import mongoose from 'mongoose'
import { TodoModel, TodoInput } from './models/todo.model'
import { UserModel, UserInput } from './models/user.model'
import jwt from 'jsonwebtoken'

dotenv.config()
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connectiong to MongoDB:', error.message))

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Token {
    value: String!
  }

  type Todo {
    id: ID!
    title: String!
    description: String
    priority: String
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, email: String!, password: String!): User
    createTodo(title: String!, description: String, priority: String): Todo!
    editTodo(
      id: ID!
      title: String
      description: String
      priority: String
    ): Todo
  }
`

const resolvers = {
  Query: {
    todos: async () => await TodoModel.find({}),
  },
  Mutation: {
    login: async (_: any, args: { username: string; password: string }) => {
      const user = await UserModel.findOne({ username: args.username })
      if (!user)
        throw new GraphQLError('Authentication failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })

      const isUser = await user.comparePassword(args.password)
      if (!isUser)
        throw new GraphQLError('Authentication failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })

      const userForToken = {
        id: user._id,
        username: user.username,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET as string) }
    },
    createUser: async (_: any, args: UserInput) => {
      const user = new UserModel({ ...args })

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Failed to save user.', {
          extensions: {
            error,
          },
        })
      }

      return user
    },
    createTodo: async (_: any, args: TodoInput) => {
      const todo = new TodoModel({ ...args })
      try {
        await todo.save()
      } catch (error) {
        throw new GraphQLError('Failed to save todo.', {
          extensions: {
            error,
          },
        })
      }
      return todo
    },
    editTodo: async (
      _: any,
      args: {
        id: string
        title?: string
        description?: string
        priority?: string
      }
    ) => {
      const todo = await TodoModel.findById(args.id)

      if (!todo) {
        throw new GraphQLError(`Todo with id: ${args.id} don't exists.`, {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      todo.title = args.title || todo.title
      todo.description = args.description || todo.description
      todo.priority = args.priority || todo.priority

      try {
        await todo.save()
      } catch (error) {
        throw new GraphQLError(`Failed to save modifications`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            error,
          },
        })
      }

      return todo
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server is running at: ${url}`)
})
