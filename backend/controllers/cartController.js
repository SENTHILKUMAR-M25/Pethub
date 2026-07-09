import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice images category stock"
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice images category stock"
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = Math.max(1, quantity);
    await cart.save();

    const updated = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice images category stock"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    const updated = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice images category stock"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product",
        "name price originalPrice images category stock"
      );
      return res.json(cart || { user: req.user._id, items: [] });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      const existing = cart.items.find(
        (item) => item.product.toString() === guestItem.productId
      );
      if (existing) {
        existing.quantity = Math.max(existing.quantity, guestItem.quantity);
      } else {
        cart.items.push({ product: guestItem.productId, quantity: guestItem.quantity });
      }
    }

    await cart.save();
    const updated = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice images category stock"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
