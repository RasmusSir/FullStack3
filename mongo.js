const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = process.env.MONGODB_URI

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
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