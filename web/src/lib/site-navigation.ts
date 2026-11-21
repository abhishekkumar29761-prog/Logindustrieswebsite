export const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Products", href: "/products" },
  { label: "Contact Us", href: "/contact" },
];

export const quickLinks = [
  ...primaryLinks.slice(0, 3),
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  primaryLinks[3],
];
