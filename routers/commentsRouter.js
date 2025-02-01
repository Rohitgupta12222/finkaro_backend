const express = require('express');
const router = express.Router();
const Comment = require('../models/comments.js'); // Adjust the path as needed
const { jwtAuthMiddleWare } = require('../jwt/jwt.js');


router.post("/add", async (req, res) => {
  try {
    console.log(req.body, "req body");
    const { courseId, name, message } = req.body;

    if (!courseId) return res.status(400).json({ success: false, message: "courseId is required" });
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });

    // ✅ Use 'courseId' instead of 'Id' for clarity
    const newComment = new Comment({ courseId, name, message });

    await newComment.save();
    res.status(201).json({ success: true, message: "Comment added successfully!", data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get/:courseId", async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let query = { courseId: req.params.courseId }; // Filter by courseId

    // Check if status is provided and handle it as an array
    if (status) {
      // If status is a string, split it into an array (e.g., "approved,pending" => ["approved", "pending"])
      if (typeof status === "string") {
        status = status.split(","); // Split status by commas
      }

      // Log status for debugging
      console.log('Querying with status:', status);

      query.status = { $in: status }; // Match any of the statuses in the array
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })  // Sort in descending order based on createdAt
      .skip((page - 1) * limit)
      .limit(limit);

    const totalComments = await Comment.countDocuments(query);
    res.json({
      data: comments,
      count: totalComments,
   
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.put("/update/:id", jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user;

  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  try {
    const { status } = req.body; // Get status from request body
    const validStatuses = ['approved', 'pending']; // Example of valid statuses
    
    // Check if the passed status is valid
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!comment) return res.status(404).json({ success: false, message: "Comment not found!" });

    res.json({ success: true, message: "Comment status updated!", data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// 4. Delete Comment by ID
router.delete("/delete/:id",jwtAuthMiddleWare, async (req, res) => {
    const tokenUser = req.user;
    if (tokenUser?.role !== 'admin' ) {
      return res.status(403).json({ message: 'User is not an admin' });
    }

  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found!" });

    res.json({ success: true, message: "Comment deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;