import { Product, ProductVariant } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("warm-delights-cart");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse cart data", e);
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("warm-delights-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product: Product, quantity: number = 1, selectedVariant?: ProductVariant) {
  const cart = getCart();
  const existing = cart.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedVariant?.name === selectedVariant?.name
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity, selectedVariant });
  }
  saveCart(cart);
}

export function removeFromCart(productId: string, selectedVariantName?: string) {
  const cart = getCart().filter(
    (item) =>
      !(item.product.id === productId && item.selectedVariant?.name === selectedVariantName)
  );
  saveCart(cart);
}

export function updateCartQuantity(productId: string, selectedVariantName: string | undefined, quantity: number) {
  const cart = getCart();
  const item = cart.find(
    (i) =>
      i.product.id === productId &&
      i.selectedVariant?.name === selectedVariantName
  );
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}
