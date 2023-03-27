import * as dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import gql from 'graphql-tag'
import mongoose from 'mongoose'
import { TodoModel, Todo } from './models/todo.model'
import { GraphQLError } from 'graphql'

dotenv.config()
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connectiong to MongoDB:', error.message))

const typeDefs = gql`
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
    createTodo: async (_: any, args: Todo) => {
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
        id: String
        title?: String
        description?: String
        priority?: String
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
