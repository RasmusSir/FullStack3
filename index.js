require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')


//MW: Express Static & Json
app.use(express.static('build'))
app.use(express.json())
//MW: CORS
app.use(cors())

//MW: Morgan
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





//Infosivun luominen
app.get('/info', (request, response, next) => {
  Person.countDocuments({}).then(count => {
    response.send(
      `<p>Phonebook has info for ${count} people</p>
      <p>${new Date().toString()}</p>`)
  })
    .catch(error => next(error))
})


// Henkilöiden hekaminen
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Yksittäisen henkilön hakeminen
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
}
)

// Henkilön poistaminen listalta
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//Jo syötetyn henkilön numeron vaihtaminen
app.put('/api/persons/:id', (request, response, next) => {
  const newBody = request.body
  const id = request.params.id
  console.log('Changing Name To', request.body);

  Person.findByIdAndUpdate(id, newBody, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error)
    )
})

// Uuden henkilön lisääminen
app.post('/api/persons', (request, response, next) => {
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

  Person.findOne({ name: body.name })
    .then(personExisting => {
      if (personExisting) {
        return response.status(400).json({
          error: 'values must be unique'
        })
      }
      const person = new Person({
        name: body.name,
        number: body.number || false,
      })

      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error)
        )
    })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


//MW: Error Handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
     return response.status(400).json({error: error.message})
  }
  
  next(error)
}
app.use(errorHandler)