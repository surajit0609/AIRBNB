const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number, // 'Number' should be capitalized (JavaScript data type)
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now() // No parentheses here; pass the function reference
    }
});

module.exports = mongoose.model("Review", reviewSchema);
