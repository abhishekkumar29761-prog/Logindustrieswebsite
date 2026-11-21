import Link from "next/link";

import { InfoPage } from "@/components/info-page";

export default function RefundPolicyPage() {
  return (
    <InfoPage
      title="Refund Policy"
      intro="Please contact LOG Industries before returning a product or arranging a refund so our team can review your order and advise you on the next steps."
      sections={[
        {
          title: "Orders and payment",
          paragraphs: [
            "The online store currently does not collect payment. Order details, shipping, and payment arrangements are confirmed separately by our team.",
            "If you have made a payment directly to LOG Industries, contact us with your order number and payment details. Our team will confirm the applicable resolution before you send any item back.",
          ],
        },
        {
          title: "Requesting help",
          paragraphs: [
            "For a return, refund, or order issue, email industrieslog@gmail.com or call +91 99102 52540. Include your order number, the product name, and a short description of the issue.",
            "Please wait for return instructions from our team before shipping a product. Any resolution will be confirmed with you after the order details have been reviewed.",
          ],
        },
        {
          title: "Related information",
          paragraphs: [
            <>For delivery or order questions, see <Link href="/contact" className="font-semibold text-cyan-900 hover:underline">Contact Us</Link>. See our <Link href="/terms-and-conditions" className="font-semibold text-cyan-900 hover:underline">Terms & Conditions</Link> for how orders are confirmed.</>,
          ],
        },
      ]}
    />
  );
}
