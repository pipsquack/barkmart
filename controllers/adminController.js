const { Product, Category, Order, OrderItem, User, Address } = require('../models');
const { createSlug } = require('../utils/helpers');
const { paginate } = require('../utils/pagination');
const { Op } = require('sequelize');

// Dashboard
exports.dashboard = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalUsers = await User.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });

    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user' }]
    });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders
      },
      recentOrders
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading dashboard.');
    res.redirect('/');
  }
};

// Products Management

// List products
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, search } = req.query;
    const where = {};

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20
    });

    const pagination = paginate(page, 20, count);

    res.render('admin/products/index', {
      title: 'Manage Products',
      products,
      pagination,
      currentSearch: search || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading products.');
    res.redirect('/admin/dashboard');
  }
};

// Show create product form
exports.showCreateProduct = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('admin/products/create', {
      title: 'Create Product',
      categories
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading form.');
    res.redirect('/admin/products');
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, stock_quantity, is_active } = req.body;

    const slug = createSlug(name);
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    await Product.create({
      category_id,
      name,
      slug,
      description,
      price,
      stock_quantity,
      image_url,
      is_active: is_active === 'true'
    });

    req.flash('success', 'Product created successfully.');
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error creating product.');
    res.redirect('/admin/products/create');
  }
};

// Show edit product form
exports.showEditProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }

    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('admin/products/edit', {
      title: 'Edit Product',
      product,
      categories
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading product.');
    res.redirect('/admin/products');
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }

    const { category_id, name, description, price, stock_quantity, is_active } = req.body;

    product.category_id = category_id;
    product.name = name;
    product.slug = createSlug(name);
    product.description = description;
    product.price = price;
    product.stock_quantity = stock_quantity;
    product.is_active = is_active === 'true';

    if (req.file) {
      product.image_url = `/uploads/${req.file.filename}`;
    }

    await product.save();

    req.flash('success', 'Product updated successfully.');
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating product.');
    res.redirect(`/admin/products/${req.params.id}/edit`);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }

    await product.destroy();

    req.flash('success', 'Product deleted successfully.');
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting product.');
    res.redirect('/admin/products');
  }
};

// Orders Management

// List orders
exports.listOrders = async (req, res) => {
  try {
    const { page = 1, status } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user' }],
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20
    });

    const pagination = paginate(page, 20, count);

    res.render('admin/orders/index', {
      title: 'Manage Orders',
      orders,
      pagination,
      currentStatus: status || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading orders.');
    res.redirect('/admin/dashboard');
  }
};

// Show order details
exports.showOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Address, as: 'shippingAddress' }
      ]
    });

    if (!order) {
      req.flash('error', 'Order not found.');
      return res.redirect('/admin/orders');
    }

    res.render('admin/orders/show', {
      title: `Order ${order.order_number}`,
      order
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading order.');
    res.redirect('/admin/orders');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      req.flash('error', 'Order not found.');
      return res.redirect('/admin/orders');
    }

    order.status = req.body.status;
    await order.save();

    req.flash('success', 'Order status updated successfully.');
    res.redirect(`/admin/orders/${order.id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating order status.');
    res.redirect('/admin/orders');
  }
};

// Users Management

// List users
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20
    });

    const pagination = paginate(page, 20, count);

    res.render('admin/users/index', {
      title: 'Manage Users',
      users,
      pagination,
      currentSearch: search || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading users.');
    res.redirect('/admin/dashboard');
  }
};
