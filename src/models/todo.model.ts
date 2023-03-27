import mongoose from 'mongoose'

export interface Todo {
  title: String
  description?: String
  priority?: String
}

export interface TodoDocument extends Todo, mongoose.Document {
  createdAt: Date
  updatedAt: Date
}

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
    },
  },
  { timestamps: true }
)

export const TodoModel = mongoose.model<TodoDocument>('Todo', schema)
