import Link from "next/link";

import { canonicalMetadata, publicRoutes } from "@/lib/seo";
import { InfoPage } from "@/components/info-page";

export const metadata = canonicalMetadata(publicRoutes.about);

export default function AboutPage() {
  return (
    <InfoPage
      title="About Us"
      intro="LOG Industries offers smart hardware and practical products for homes, workplaces, and other spaces."
      sections={[
        {
          title: "What we offer",
          paragraphs: [
            "Our catalogue brings together automatic water-level controllers, sanitizer dispensers, smartphone security locks, and automatic hydraulic door closers.",
            <>Explore the <Link href="/products" className="font-semibold text-cyan-900 hover:underline">product catalogue</Link> for current product details, photos, and listed prices. For availability, delivery, or product questions, please contact our team.</>,
          ],
        },
        {
          title: "Our approach",
          paragraphs: [
            "We aim to make it straightforward to browse product information and get in touch with our team before placing an order.",
          ],
        },
      ]}
    />
  );
}
