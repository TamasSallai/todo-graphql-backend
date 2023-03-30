import { GraphQLError } from 'graphql'
import gql from 'graphql-tag'
import { TodoInput, TodoModel } from '../models/todo.model'

export const typeDefs = gql`
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

export const resolvers = {
  Query: {
    todos: async () => await TodoModel.find({}),
  },
  Mutation: {
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
