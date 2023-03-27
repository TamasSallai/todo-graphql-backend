import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

interface Todo {
  id: number
  name: string
}

const todos: Todo[] = [
  {
    id: 1,
    name: 'Learn Typescript',
  },
  {
    id: 2,
    name: 'Learn GraphQL',
  },
  {
    id: 3,
    name: 'Implement a todo application with typescript and graphql',
  },
]

const typeDefs = `
    type Todo {
        id: Int!
        name: String!
    }

    type Query {
        todos: [Todo!]!
    }
`

const resolvers = {
  Query: {
    todos: () => todos,
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
