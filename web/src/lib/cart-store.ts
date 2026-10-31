export type CartLine = { productId: string; quantity: number };

const cartStorageKey = "log-industries-cart";
const cartChangeEvent = "log-industries-cart-change";

export function subscribeToCart(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(cartChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(cartChangeEvent, onChange);
  };
}

export function getCartSnapshot() {
  return window.localStorage.getItem(cartStorageKey) ?? "[]";
}

export function getServerCartSnapshot() {
  return "[]";
}

export function parseCart(value: string): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is CartLine =>
      line !== null && typeof line === "object" &&
      typeof line.productId === "string" && Number.isInteger(line.quantity) &&
      line.quantity > 0 && line.quantity <= 99,
    );
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(lines));
  window.dispatchEvent(new Event(cartChangeEvent));
}

export function addCartItem(productId: string | number) {
  const normalizedId = String(productId);
  const lines = parseCart(getCartSnapshot());
  const existing = lines.find((line) => line.productId === normalizedId);
  if (existing) {
    writeCart(lines.map((line) => line.productId === normalizedId
      ? { ...line, quantity: Math.min(line.quantity + 1, 99) }
      : line));
    return;
  }
  writeCart([...lines, { productId: normalizedId, quantity: 1 }]);
}

export function setCartQuantity(productId: string, quantity: number) {
  const lines = parseCart(getCartSnapshot());
  writeCart(quantity <= 0
    ? lines.filter((line) => line.productId !== productId)
    : lines.map((line) => line.productId === productId ? { ...line, quantity: Math.min(quantity, 99) } : line));
}

export function removeCartItem(productId: string) {
  setCartQuantity(productId, 0);
}

export function clearCart() {
  writeCart([]);
}