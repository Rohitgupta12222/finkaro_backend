const express = require('express');
const router = express.Router();
const Card = require('../models/card');

router.get('/get', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/add', async (req, res) => {
    const { percentage, companyName, duration, logo } = req.body;

    const newCard = new Card({
        percentage,
        companyName,
        duration,
        logo,
    });

    try {
        const savedCard = await newCard.save();
        res.status(201).json(savedCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { percentage, companyName, duration, logo } = req.body;

    try {
        const updatedCard = await Card.findByIdAndUpdate(
            id,
            { percentage, companyName, duration, logo },
            { new: true, runValidators: true }
        );

        if (!updatedCard) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.json(updatedCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;