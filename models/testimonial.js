const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [20, 'Name should not exceed 20 characters']
    },
    profession: {
        type: String,
        required: true,
        trim: true,
        maxlength: [20, 'Profession should not exceed 20 characters']
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [160, 'Content should not exceed 160 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
