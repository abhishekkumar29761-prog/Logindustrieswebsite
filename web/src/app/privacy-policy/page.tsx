import { InfoPage } from "@/components/info-page";
import { canonicalMetadata, publicRoutes } from "@/lib/seo";

export const metadata = canonicalMetadata(publicRoutes.privacy);

const emailLink = (
  <a href="mailto:industrieslog@gmail.com" className="font-semibold text-cyan-900 hover:underline">
    industrieslog@gmail.com
  </a>
);

const phoneLink = (
  <a href="tel:+919910252540" className="font-semibold text-cyan-900 hover:underline">
    +91 99102 52540
  </a>
);

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="LOG Industries (Raja Engineering Works) explains what personal data we collect, why we use it, and what rights you have. This policy is intended to align with applicable Indian law, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023."
      sections={[
        {
          title: "1. Who we are",
          paragraphs: [
            <>This website is operated by Raja Engineering Works, trading as LOG Industries (“we”, “us”), at 172 Chand Nagar, New Delhi – 110018, India. GSTIN: 07AVAPS6458B1ZK.</>,
            <>Phone/WhatsApp: {phoneLink} | Email: {emailLink}.</>,
          ],
        },
        {
          title: "2. What we collect",
          paragraphs: [
            <><strong>Contact details:</strong> name, phone, email, billing and delivery address.</>,
            <><strong>Business invoice details:</strong> company name, GSTIN and PAN, only where needed for a tax invoice.</>,
            <><strong>Order information:</strong> products, quantity, price, tax, order and payment status, and invoices.</>,
            <><strong>Account information:</strong> login details, stored securely, and order history.</>,
            <><strong>Payment references:</strong> transaction ID and payment/refund status. We do not collect or store your card number, CVV, UPI PIN or netbanking password. Your bank or payment provider handles these.</>,
          ],
        },
        {
          title: "3. Why we use your data",
          paragraphs: [
            "We use your data to create and manage your account; process, deliver, invoice and refund orders; handle returns, warranty matters and complaints; and answer your enquiries.",
            "We also use it to prevent fraud and keep the website secure, maintain GST, tax and accounting records required by law, and send order updates and promotions where you have agreed or the law allows.",
            <>You can withdraw consent at any time. This does not affect processing already done lawfully or processing needed to complete your order or meet a legal duty. To opt out of promotional messages, write to {emailLink} or call {phoneLink}.</>,
          ],
        },
        {
          title: "4. Cookies",
          paragraphs: [
            "We use necessary cookies for the cart, checkout, login and security. Analytics or advertising cookies, if used, are switched on only after you allow them. You can also change your browser settings, but blocking necessary cookies may stop parts of the site from working.",
          ],
        },
        {
          title: "5. Who we share data with",
          paragraphs: [
            "We do not sell your personal data. We share it only as needed with courier partners, banks and payment gateways, hosting, email, SMS, WhatsApp and analytics providers acting on our instructions, professional advisers, and courts or authorities where the law requires.",
            "Some providers may process data outside India. We do this only as the law permits and with suitable safeguards.",
          ],
        },
        {
          title: "6. Data security and retention",
          paragraphs: [
            "We use reasonable security measures, including HTTPS and restricted admin access. No system is completely secure. If a data breach occurs, we will respond and notify you and the authorities as required by law.",
            "We keep personal data only as long as needed for the purpose it was collected, or as the law requires, and then delete or anonymise it.",
          ],
        },
        {
          title: "7. Your rights",
          paragraphs: [
            <>Subject to law and identity verification, you may ask us to give you a summary of your data, correct or update it, erase it (unless we must legally keep it), or withdraw consent. Write to {emailLink} or call {phoneLink}.</>,
            "Our website is for adults. You must be 18 or older to create an account or place an order.",
          ],
        },
        {
          title: "8. Grievance Officer and changes",
          paragraphs: [
            <>Grievance Officer: Raja Engineering Works, 172 Chand Nagar, New Delhi – 110018. Email: {emailLink} | Phone: {phoneLink}.</>,
            "We acknowledge complaints within 48 hours and aim to resolve them within one month.",
            "We may update this policy from time to time. The updated version will be posted on this page.",
          ],
        },
      ]}
    />
  );
}
