const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { paginate } = require('../utils/pagination');

// List all products
exports.list = async (req, res) => {
  try {
    const { page = 1, category, search, sort = 'newest' } = req.query;

    const where = { is_active: true };

    // Filter by category
    if (category) {
      const categoryObj = await Category.findOne({ where: { slug: category } });
      if (categoryObj) {
        where.category_id = categoryObj.id;
      }
    }

    // Search
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Sorting
    let order = [['created_at', 'DESC']];
    if (sort === 'price-low') {
      order = [['price', 'ASC']];
    } else if (sort === 'price-high') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name', 'ASC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order,
      limit: 12,
      offset: (page - 1) * 12
    });

    const pagination = paginate(page, 12, count);
    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('products/index', {
      title: 'Products',
      products,
      categories,
      pagination,
      currentCategory: category || null,
      currentSearch: search || '',
      currentSort: sort
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading products.');
    res.redirect('/');
  }
};

// Show single product
exports.show = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/products');
    }

    res.render('products/show', {
      title: product.name,
      product
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading product.');
    res.redirect('/products');
  }
};
