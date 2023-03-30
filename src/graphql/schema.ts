import merge from 'lodash.merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs as authTypeDefs, resolvers as authResolvers } from './auth'
import { typeDefs as todoTypeDefs, resolvers as todoResolvers } from './todo'

export const schema = makeExecutableSchema({
  typeDefs: [authTypeDefs, todoTypeDefs],
  resolvers: merge(authResolvers, todoResolvers),
})
