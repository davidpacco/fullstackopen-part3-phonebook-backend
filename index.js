require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// eslint-disable-next-line no-unused-vars
morgan.token('person-obj', (req, res) => {
  if (req.method === 'POST') return JSON.stringify(req.body)
  else return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person-obj'))
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(requestLogger)

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person)
      else res.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        existingPerson.number = body.number

        existingPerson.save()
          .then(updatedPerson => res.json(updatedPerson))
          .catch(error => next(error))
      } else {
        const person = new Person({
          name: body.name,
          number: body.number
        })

        person.save()
          .then(savedPerson => res.json(savedPerson))
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})