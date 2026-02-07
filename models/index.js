const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Address = require('./Address');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations

// User associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// Address associations
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'shippingAddress' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem
};
