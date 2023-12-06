const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connecting to MongoDB')

mongoose.connect(url)

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 4,
    required: [true, 'name is required']
  },
  number: {
    type: String,
    validate: {
      validator: (v) => /(?:\d{2}-\d{7})|(?:\d{3}-\d{8})/.test(v)
    },
    required: [true, 'number is required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)