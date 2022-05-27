const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://avat:avat@advanced-web.v9bta.mongodb.net/AVAT')
        console.log('Connect database successfully!')
    } catch (err) {
        console.log('Connect database failure!');
    }
}

module.exports = { connect }
