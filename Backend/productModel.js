// productModel.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true, // Make 'id' a unique primary key
    },
    name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Product', ProductSchema);
