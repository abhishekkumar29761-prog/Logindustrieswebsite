import Link from "next/link";

import { InfoPage } from "@/components/info-page";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact Us"
      intro="Need product information or help with an order? Contact LOG Industries and include the product name or order number so we can assist."
      sections={[
        {
          title: "Get in touch",
          paragraphs: [
            <>Email: <a href="mailto:industrieslog@gmail.com" className="font-semibold text-cyan-900 hover:underline">industrieslog@gmail.com</a></>,
            <>Phone: <a href="tel:+919910252540" className="font-semibold text-cyan-900 hover:underline">+91 99102 52540</a></>,
          ],
        },
        {
          title: "Address",
          paragraphs: ["172 Chand Nagar, New Delhi – 110018"],
        },
        {
          title: "Product enquiries",
          paragraphs: [
            <>Browse the <Link href="/products" className="font-semibold text-cyan-900 hover:underline">product catalogue</Link> and contact us for current availability, delivery details, and product support.</>,
          ],
        },
      ]}
    />
  );
}
