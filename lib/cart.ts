import { Product, ProductVariant } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedSize?: string;
  selectedFlavor?: string;
  selectedIcing?: string;
  selectedAddOns?: string[];
  calculatedPrice?: number;
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

export function addToCart(
  product: Product,
  quantity: number = 1,
  selectedVariant?: ProductVariant,
  selectedSize?: string,
  selectedFlavor?: string,
  selectedIcing?: string,
  selectedAddOns?: string[],
  calculatedPrice?: number
) {
  const cart = getCart();
  const existing = cart.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedVariant?.name === selectedVariant?.name &&
      item.selectedSize === selectedSize &&
      item.selectedFlavor === selectedFlavor &&
      item.selectedIcing === selectedIcing &&
      JSON.stringify(item.selectedAddOns) === JSON.stringify(selectedAddOns)
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product,
      quantity,
      selectedVariant,
      selectedSize,
      selectedFlavor,
      selectedIcing,
      selectedAddOns,
      calculatedPrice,
    });
  }
  saveCart(cart);
}

export function removeFromCart(
  productId: string,
  selectedVariantName?: string,
  selectedSize?: string,
  selectedFlavor?: string,
  selectedIcing?: string
) {
  const cart = getCart().filter(
    (item) =>
      !(
        item.product.id === productId &&
        item.selectedVariant?.name === selectedVariantName &&
        item.selectedSize === selectedSize &&
        item.selectedFlavor === selectedFlavor &&
        item.selectedIcing === selectedIcing
      )
  );
  saveCart(cart);
}

export function updateCartQuantity(
  productId: string,
  selectedVariantName: string | undefined,
  quantity: number,
  selectedSize?: string,
  selectedFlavor?: string,
  selectedIcing?: string
) {
  const cart = getCart();
  const item = cart.find(
    (i) =>
      i.product.id === productId &&
      i.selectedVariant?.name === selectedVariantName &&
      i.selectedSize === selectedSize &&
      i.selectedFlavor === selectedFlavor &&
      i.selectedIcing === selectedIcing
  );
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}
