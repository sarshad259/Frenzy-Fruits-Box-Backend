const Product = require("../../models/Product");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    // Regex to match titles containing the keyword (case-insensitive)
    const regEx = new RegExp(keyword, 'i');
    const searchResults = await Product.find({ title: regEx })
      .limit(20)
      .lean();

    // Capitalize the first letter of each word in the product title
    const capitalizeTitle = (title) =>
      title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const capitalizedResults = searchResults.map(product => ({
      ...product,
      title: capitalizeTitle(product.title || ""),
    }));

    res.status(200).json({
      success: true,
      data: capitalizedResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { searchProducts };
