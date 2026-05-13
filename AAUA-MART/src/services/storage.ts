import { CartItem } from '../types';

const CART_KEY = 'aauamart_cart';

export const storage = {
  async getCart(): Promise<CartItem[]> {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  },

  async saveCart(items: CartItem[]): Promise<void> {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  async addToCart(item: CartItem): Promise<void> {
    const cart = await this.getCart();
    const existing = cart.findIndex(c => c.productId === item.productId);
    if (existing >= 0) {
      cart[existing].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    await this.saveCart(cart);
  },

  async clearCart(): Promise<void> {
    localStorage.removeItem(CART_KEY);
  },
};
