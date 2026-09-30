import Category from '../models/category.model.js';

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      message: 'Categories fetched successfully',
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch categories',
      success: false,
      error: error.message,
    });
  }
};
