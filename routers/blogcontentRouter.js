const BlogContents = require('../models/BlogContent'); // Adjust the path as needed

// Add Blog Content
const addBlogContent = async (blogId, content) => {
    try {
        const newBlogContent = new BlogContents({ blogId, content });
        await newBlogContent.save();
        return { success: true, data: newBlogContent };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Update Blog Content by blogId
const updateBlogContent = async (blogId, content) => {
    try {
        const updatedBlogContent = await BlogContents.findOneAndUpdate(
            { blogId },
            { content },
            { new: true }
        );
        if (!updatedBlogContent) {
            return { success: false, message: 'Blog content not found' };
        }
        return { success: true, data: updatedBlogContent };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get Blog Content by blogId
const getBlogContent = async (blogId) => {
    try {
        const blogContent = await BlogContents.findOne({ blogId });
        if (!blogContent) {
            return { success: false, message: 'Blog content not found' };
        }
        return { success: true, data: blogContent };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Delete Blog Content by blogId
const deleteBlogContent = async (blogId) => {
    try {
        const deletedBlogContent = await BlogContents.findOneAndDelete({ blogId });
        if (!deletedBlogContent) {
            return { success: false, message: 'Blog content not found' };
        }
        return { success: true, message: 'Blog content deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    addBlogContent,
    updateBlogContent,
    getBlogContent,
    deleteBlogContent
};
