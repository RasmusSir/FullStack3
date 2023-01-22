const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://RasmusSir:${password}@cluster0.kcbd2oj.mongodb.net/personApp?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


const name = process.argv[3]
const number = process.argv[4]

if (!name === true || !number === null) {
    console.log('phonebook:');
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else {
    const person = new Person({
        name: `${name}`,
        number: `${number}`,
    })
    
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook (result: ${result}!`)
        mongoose.connection.close()
    })
}