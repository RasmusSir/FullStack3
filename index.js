require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')


app.use(cors())
app.use(express.static('build'))

morgan.token('content', function (req, res) { return (JSON.stringify(req.body)) })
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.content(req, res),
  ].join(' ')
}))

app.use(express.json())


//Infosivun luominen
app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people</p>
    <p>${new Date().toString()}</p>`)
  }).catch(error => {
    console.log('The following app.get/info error should be handled somehow:', error);
  })
})

// Henkilöiden hekaminen
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Yksittäisen henkilön hakeminen
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
}
)

// Henkilön poistaminen listalta
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(person => {
    if (!person === true) {
      return response.status(404).json({ error: "Error: Cannot find person" })
    }
    response.status(204).end()
  })
})

//Jo syötetyn henkilön numeron vaihtaminen
app.put('/api/persons/:id', (request, response) => {
  const newBody = request.body
  const id = request.params.id
  console.log('Changing Name To', request.body);

  Person.findByIdAndUpdate(id, newBody, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      console.log('The following app.put/persons/:id error should be handled somehow:', error);

      next(error)
    })
})

// Uuden henkilön lisääminen
app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log('Logging body in app.post', body);

  if (!body.name === true) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number === true) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.findOne({ name: body.name }).then(personExisting => {
    if (personExisting) {
      return response.status(400).json({
        error: 'values must be unique'
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number || false,
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})