import { GraphQLError } from 'graphql'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'
import { UserInput, UserModel } from '../models/user.model'

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Token {
    value: String!
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, email: String!, password: String!): User
  }
`

export const resolvers = {
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
  },
}
