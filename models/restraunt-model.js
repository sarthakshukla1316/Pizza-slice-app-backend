const mongoose = require('mongoose')
const Schema = mongoose.Schema

const restrauntSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, required: true },
    taste: { type: String, required: true },
    image: { type: String, required: true },
    discount: { type: String, required: true }
})



module.exports = mongoose.model('Restraunt', restrauntSchema);;