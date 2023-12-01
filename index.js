const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person-obj'))
app.use(express.json())

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const date = new Date()

  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    return res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'number is missing'
    })
  }

  const alreadyInPhone = persons.find(person => person.name === body.name)

  if (alreadyInPhone) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: Math.ceil(Math.random() * 100000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  morgan.token('person-obj', (req, res) => JSON.stringify(person))

  res.json(person)
})

const port = 3001

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})