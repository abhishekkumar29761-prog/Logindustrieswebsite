import Link from "next/link";

import { InfoPage } from "@/components/info-page";

export default function TermsAndConditionsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      intro="These terms apply when you browse or use the LOG Industries online store."
      sections={[
        {
          title: "Product information",
          paragraphs: [
            "We aim to keep product descriptions, photographs, and prices useful and up to date. Product availability, specifications, and prices may change; please contact us to confirm details before ordering.",
          ],
        },
        {
          title: "Orders, payment, and delivery",
          paragraphs: [
            "Submitting an order or enquiry through the store is not by itself confirmation of availability, dispatch, or delivery timing. Our team will confirm order details, shipping, and payment arrangements separately.",
            "The store currently does not collect online payment. Do not treat an order as confirmed until you receive confirmation from LOG Industries.",
          ],
        },
        {
          title: "Using the store",
          paragraphs: [
            "Please provide accurate contact and delivery information, keep your account credentials secure, and use the website lawfully. Product installation and use should follow the instructions provided with that product.",
          ],
        },
        {
          title: "Questions",
          paragraphs: [
            <>For questions about these terms or an order, visit <Link href="/contact" className="font-semibold text-cyan-900 hover:underline">Contact Us</Link>.</>,
          ],
        },
      ]}
    />
  );
}
