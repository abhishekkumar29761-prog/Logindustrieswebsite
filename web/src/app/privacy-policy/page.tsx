import { InfoPage } from "@/components/info-page";

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="This policy explains what information may be used when you browse the LOG Industries store, create an account, or place an order."
      sections={[
        {
          title: "Information you provide",
          paragraphs: [
            "Depending on how you use the store, this may include your name, email address, phone number, account details, delivery address, and order information.",
          ],
        },
        {
          title: "How information is used",
          paragraphs: [
            "We use this information to manage customer accounts, respond to enquiries, process and follow up on orders, and provide customer support.",
          ],
        },
        {
          title: "Service providers and security",
          paragraphs: [
            "The store relies on third-party hosting, authentication, and database services to operate. Information needed to provide these services may be processed by those providers.",
            "We take reasonable steps to protect account and order information. Please keep your password private and contact us if you believe your account has been accessed without permission.",
          ],
        },
        {
          title: "Your choices and questions",
          paragraphs: [
            "You may contact us to ask about, correct, or request deletion of personal information associated with your account, subject to information we need to retain for order, legal, or security purposes.",
            <>For privacy requests, email <a href="mailto:industrieslog@gmail.com" className="font-semibold text-cyan-900 hover:underline">industrieslog@gmail.com</a>.</>,
          ],
        },
      ]}
    />
  );
}
