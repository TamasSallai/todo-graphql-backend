import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export interface UserInput {
  username: string
  email: string
  password: string
}

interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
    },
    email: {
      type: String,
      required: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

schema.pre('save', async function (this: UserDocument) {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

schema.methods.comparePassword = async function (candidatePassword: string) {
  const user = this as UserDocument
  return bcrypt.compare(candidatePassword, user.password)
}

export const UserModel = mongoose.model<UserDocument>('user', schema)
