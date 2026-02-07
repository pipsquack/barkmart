const { Order, OrderItem, Product, Address } = require('../models');
const { paginate } = require('../utils/pagination');

// List user orders
exports.list = async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 10,
      offset: (page - 1) * 10
    });

    const pagination = paginate(page, 10, count);

    res.render('orders/index', {
      title: 'My Orders',
      orders,
      pagination
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading orders.');
    res.redirect('/');
  }
};

// Show single order
exports.show = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
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
      return res.redirect('/orders');
    }

    res.render('orders/show', {
      title: `Order ${order.order_number}`,
      order
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading order.');
    res.redirect('/orders');
  }
};
