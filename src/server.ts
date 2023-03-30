import * as dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import mongoose from 'mongoose'
import { schema } from './graphql/schema'

dotenv.config()
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connectiong to MongoDB:', error.message))

const server = new ApolloServer({ schema })

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server is running at: ${url}`)
})
