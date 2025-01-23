
const express = require('express');
const Book = require('../models/book');
const router = express.Router();
const path = require('path')
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const fs = require('fs'); // To delete files if necessary

router.post('/add', jwtAuthMiddleWare, async (req, res) => {
    try {
        const tokenUser = req.user
        console.log(tokenUser);
        if (tokenUser?.role !== 'admin' || tokenUser?.role !==  'superadmin') return res.status(40).json({ message: 'User is not a admin ' });

        const newBook = new Book({
            userId: tokenUser?.id,
            pdfFile: 'assets/product/Finkaro-Book-Romance-with-Equity.pdf',
            actualEbookPrice: req.body.actualEbookPrice || 0,
            offerEbookPrice: req.body.offerEbookPrice || 0,
            actualHardPrice: req.body.actualHardPrice || 0,
            offerHardPrice: req.body.offerHardPrice || 0,
            shippingPrice:req.body.offerHardPrice || 0,
            count: req.body.count || 0
        });
        const response = await newBook.save()
        res.status(201).json({ response: response, message: "Book created" })


    } catch (message) {

        console.log('message ', message);
        res.status(500).json({
            message: "internal Server message",
            message: message
        })
    }
}
)
router.put('/update/:id', jwtAuthMiddleWare, async (req, res) => {
    try {
        const tokenUser = req.user;

        if (tokenUser?.role !== 'admin' || tokenUser?.role !==  'superadmin') {
            return res.status(401).json({ message: 'User is not an admin' });
        }

        // Find the book by ID
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Fields to update
        const updateFields = {
            actualEbookPrice: req.body.actualEbookPrice || book.actualEbookPrice,
            offerEbookPrice: req.body.offerEbookPrice || book.offerEbookPrice,
            actualHardPrice: req.body.actualHardPrice || book.actualHardPrice,
            offerHardPrice: req.body.offerHardPrice || book.offerHardPrice,
            shippingPrice: req.body.shippingPrice || book.shippingPrice,
            count: req.body.count || book.count,
            updatedAt: Date.now() // Update the timestamp
        };

        // Update the book
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found after update attempt' });
        }

        res.status(200).json({ response: updatedBook, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


router.get('/get', async (req, res) => {
    try {
    const books = await Book.find()
        // Return the response with paginated results
        res.status(200).json({
            data: books
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while retrieving Books' });
    }
});


router.get('/getBooks/:id', async (req, res) => {
    try {
        // Extract Book ID from URL parameters
        const { id } = req.params;

        // Find the Book by ID
        const Book = await Book.findById(id);

        // Check if Book exists
        if (!Book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Send the Book data in the response
        res.status(200).json(Book);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



module.exports = router;
