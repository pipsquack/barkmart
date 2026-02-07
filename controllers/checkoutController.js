const { Cart, CartItem, Product, Order, OrderItem, Address } = require('../models');
const { generateOrderNumber } = require('../utils/helpers');
const { sequelize } = require('../models');

// Show checkout form
exports.show = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    res.render('checkout/index', {
      title: 'Checkout',
      cart: { ...cart.toJSON(), total },
      addresses
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading checkout.');
    res.redirect('/cart');
  }
};

// Process order
exports.processOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { address_id, payment_method, notes, new_address } = req.body;

    let shippingAddressId = address_id;

    // Create new address if provided
    if (new_address === 'true') {
      const newAddress = await Address.create({
        user_id: req.user.id,
        street_address: req.body.street_address,
        city: req.body.city,
        state: req.body.state,
        zip_code: req.body.zip_code,
        country: req.body.country || 'USA',
        is_default: false
      }, { transaction });

      shippingAddressId = newAddress.id;
    }

    if (!shippingAddressId) {
      throw new Error('No shipping address provided.');
    }

    // Get cart with items
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}.`);
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      order_number: generateOrderNumber(),
      status: 'pending',
      total_amount: totalAmount,
      shipping_address_id: shippingAddressId,
      payment_method,
      notes: notes || null
    }, { transaction });

    // Create order items and update stock
    for (const item of cart.items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: parseFloat(item.product.price) * item.quantity
      }, { transaction });

      // Update product stock
      await item.product.decrement('stock_quantity', {
        by: item.quantity,
        transaction
      });
    }

    // Clear cart
    await CartItem.destroy({
      where: { cart_id: cart.id },
      transaction
    });

    await transaction.commit();

    req.flash('success', 'Order placed successfully!');
    res.redirect(`/checkout/success/${order.order_number}`);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    req.flash('error', error.message || 'Error processing order.');
    res.redirect('/checkout');
  }
};

// Show order success page
exports.success = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        order_number: req.params.orderNumber,
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

    res.render('checkout/success', {
      title: 'Order Confirmation',
      order
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading order.');
    res.redirect('/orders');
  }
};
