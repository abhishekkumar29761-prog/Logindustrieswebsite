const customerTokenKey = "logindustries-customer-token";
const customerAuthEvent = "logindustries-customer-auth-change";

export function subscribeToCustomerAuth(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(customerAuthEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(customerAuthEvent, onChange);
  };
}

export function getCustomerToken() {
  return window.sessionStorage.getItem(customerTokenKey);
}

export function getServerCustomerToken() {
  return null;
}

export function setCustomerToken(token: string) {
  window.sessionStorage.setItem(customerTokenKey, token);
  window.dispatchEvent(new Event(customerAuthEvent));
}

export function clearCustomerToken() {
  window.sessionStorage.removeItem(customerTokenKey);
  window.dispatchEvent(new Event(customerAuthEvent));
}