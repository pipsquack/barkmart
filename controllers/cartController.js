const { Cart, CartItem, Product } = require('../models');

// Get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, as: 'product' }]
    }]
  });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
    cart.items = [];
  }

  return cart;
};

// Show cart
exports.show = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    const cartWithTotal = {
      ...cart.toJSON(),
      total: cart.items.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0)
    };

    res.render('cart/index', {
      title: 'Shopping Cart',
      cart: cartWithTotal
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading cart.');
    res.redirect('/');
  }
};

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }

    const cart = await getOrCreateCart(req.user.id);

    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + parseInt(quantity);
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock.' });
      }
      existingItem.quantity = newQuantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity: parseInt(quantity)
      });
    }

    const updatedCart = await getOrCreateCart(req.user.id);

    res.json({
      success: true,
      message: 'Product added to cart.',
      cartCount: updatedCart.items.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error adding to cart.' });
  }
};

// Update cart item quantity
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartItem.findByPk(id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!cartItem) {
      req.flash('error', 'Cart item not found.');
      return res.redirect('/cart');
    }

    if (cartItem.product.stock_quantity < quantity) {
      req.flash('error', 'Insufficient stock.');
      return res.redirect('/cart');
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    req.flash('success', 'Cart updated.');
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating cart.');
    res.redirect('/cart');
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await CartItem.findByPk(id);

    if (!cartItem) {
      req.flash('error', 'Cart item not found.');
      return res.redirect('/cart');
    }

    await cartItem.destroy();

    req.flash('success', 'Item removed from cart.');
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error removing item.');
    res.redirect('/cart');
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });

    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    req.flash('success', 'Cart cleared.');
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error clearing cart.');
    res.redirect('/cart');
  }
};
