const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};
    let useEffectivePrice = false;

    // Determine if a size filter is applied
    const sizeFilter = req.query.size && typeof req.query.size === 'string' ? req.query.size : null;
    let sizePriceField = null;
    let sizeSalePriceField = null;
    if (sizeFilter) {
      const sizeKey = sizeFilter.toLowerCase();
      if (sizeKey === 'small') {
        sizePriceField = 'smallPrice';
        sizeSalePriceField = 'smallSalePrice';
      } else if (sizeKey === 'medium') {
        sizePriceField = 'mediumPrice';
        sizeSalePriceField = 'mediumSalePrice';
      } else if (sizeKey === 'large') {
        sizePriceField = 'largePrice';
        sizeSalePriceField = 'largeSalePrice';
      }
    }

    switch (sortBy) {
      case "price-lowtohigh":
        useEffectivePrice = true;
        sort = { effectivePrice: 1 };
        break;
      case "price-hightolow":
        useEffectivePrice = true;
        sort = { effectivePrice: -1 };
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    let products = await Product.find(filters).lean();

    // Filtering by size: only include products with a valid price for the selected size
    let filteredProducts = products;
    if (sizePriceField) {
      filteredProducts = products.filter(p => {
        const price = Number(p[sizePriceField]);
        return !isNaN(price) && price > 0;
      });
    }

    if (useEffectivePrice) {
      filteredProducts.forEach(p => {
        // Gather all possible prices (sizes and sale prices)
        const prices = [];
        // Add size prices and sale prices if present
        ['small', 'medium', 'large'].forEach(size => {
          const sale = Number(p[`${size}SalePrice`]);
          const price = Number(p[`${size}Price`]);
          if (!isNaN(sale) && sale > 0) prices.push(sale);
          if (!isNaN(price) && price > 0) prices.push(price);
        });
        // Add base salePrice/price
        const baseSale = Number(p.salePrice);
        const basePrice = Number(p.price);
        if (!isNaN(baseSale) && baseSale > 0) prices.push(baseSale);
        if (!isNaN(basePrice) && basePrice > 0) prices.push(basePrice);
        // Compute effective price
        if (prices.length > 0) {
          p.effectivePrice = sort.effectivePrice > 0
            ? Math.min(...prices) // low to high
            : Math.max(...prices); // high to low
        } else {
          p.effectivePrice = 0;
        }
      });
      filteredProducts.sort((a, b) => sort.effectivePrice * (a.effectivePrice - b.effectivePrice));
    } else {
      filteredProducts = filteredProducts.sort((a, b) => {
        if (sort.title) return sort.title * a.title.localeCompare(b.title);
        return 0;
      });
    }

    res.status(200).json({
      success: true,
      data: filteredProducts,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
