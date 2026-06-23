import { Link } from "react-router-dom";

interface Section { title: string; body: string[] }

const sections: Record<string, Section[]> = {
  legal: [
    { title: "Publisher", body: ["YKonline Shop - Online store specializing in premium organic shea butter.", "Contact: hello@ykonlineshop.com"] },
    { title: "Director of publication", body: ["The director of publication is the founder of YKonline Shop."] },
    { title: "Hosting", body: ["This website is hosted by a professional hosting provider. Contact details can be provided on request."] },
    { title: "Intellectual property", body: ["All content (text, images, logos) on this site is the exclusive property of YKonline Shop, except where otherwise noted. Any reproduction without permission is prohibited."] },
    { title: "Contact", body: ["For any question relating to this legal notice, you can contact us at hello@ykonlineshop.com or via our contact page."] },
  ],
  terms: [
    { title: "Purpose", body: ["These general terms and conditions govern the use of the YKonline Shop website and the purchase of products offered on the site."] },
    { title: "Orders", body: ["Any order implies acceptance without reservation of these terms and conditions. Orders are confirmed after validation of payment and availability of products."] },
    { title: "Prices", body: ["Prices are displayed in US dollars, all taxes included, excluding shipping costs. Shipping costs are specified before payment confirmation."] },
    { title: "Payment", body: ["Payment is due at the time of ordering. We accept credit cards, PayPal, Apple Pay, Google Pay, mobile money and bank transfer. All payments are secured by SSL encryption."] },
    { title: "Delivery", body: ["Orders are prepared and shipped within 24 to 48 hours. Delivery times vary according to destination. Shipping is free for orders above $50."] },
    { title: "Right of withdrawal", body: ["You have 14 days from receipt of your order to return any unopened product in its original condition. The refund is made within 14 days of receipt of the return."] },
    { title: "Liability", body: ["YKonline Shop cannot be held responsible for misuse of products. Our products are cosmetic care products and in no case constitute medical treatment."] },
  ],
  privacy: [
    { title: "Data collected", body: ["We collect the information you provide when placing an order, creating an account, subscribing to our newsletter or contacting us: name, email, phone, postal address, payment details."] },
    { title: "Use of data", body: ["Your data is used to process your orders, ensure delivery, manage your customer account, send you our newsletter (if you have subscribed), and improve our services."] },
    { title: "Data retention", body: ["Your data is kept for the time necessary to provide our services and to meet our legal obligations. You can request the deletion of your data at any time."] },
    { title: "Data security", body: ["We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, modification, disclosure or destruction."] },
    { title: "Your rights", body: ["You have the right to access, rectify, delete and port your data, as well as the right to object and limit processing. To exercise these rights, contact us at hello@ykonlineshop.com."] },
    { title: "Cookies", body: ["We use cookies to improve your browsing experience and analyze our traffic. You can manage your cookie preferences at any time from your browser."] },
  ],
  cookies: [
    { title: "What is a cookie?", body: ["A cookie is a small text file placed on your device when you visit a website. It allows the site to remember your actions and preferences over time."] },
    { title: "Types of cookies used", body: ["Essential cookies: necessary for the proper functioning of the site.", "Analytics cookies: help us understand how visitors interact with the site.", "Preference cookies: remember your settings such as language or currency."] },
    { title: "Managing cookies", body: ["You can configure your browser to refuse cookies or to alert you when cookies are being sent. However, some parts of the site may not function properly without cookies."] },
    { title: "Third-party cookies", body: ["Our site may use third-party services (analytics, social media, payment) which may place their own cookies on your device. These cookies are governed by the privacy policies of these third parties."] },
  ],
  shipping: [
    { title: "Shipping methods", body: ["We offer several shipping methods: Standard (3-5 business days), Express (1-2 business days). Shipping costs are calculated according to your location and order weight."] },
    { title: "Free shipping", body: ["Shipping is free for all orders above $50, before any applicable discount. This offer applies automatically at checkout."] },
    { title: "Processing time", body: ["Orders placed before 2pm are generally prepared the same day. Orders placed on weekends or holidays are prepared the next business day."] },
    { title: "Returns & Refunds", body: ["You can return any unopened product in its original condition within 14 days of receipt. To initiate a return, contact our customer service with your order number.", "Once the return is received and inspected, a refund will be issued to your original payment method within 14 business days."] },
    { title: "Damaged or defective products", body: ["If you receive a damaged or defective product, please contact us immediately with photos. We will arrange a replacement or refund at our expense."] },
  ],
};

const titles: Record<string, string> = {
  legal: "Legal Notice",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  shipping: "Shipping & Returns",
};

export default function Legal({ page }: { page: keyof typeof sections }) {
  const content = sections[page];
  const title = titles[page];
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-cream to-green-light py-14">
        <div className="container-page max-w-4xl">
          <p className="text-sm text-gray-500 mb-2"><Link to="/" className="hover:text-green">Home</Link> / {title}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-3">Last updated: January 2026</p>
        </div>
      </section>
      <section className="container-page max-w-4xl py-14">
        <div className="prose max-w-none space-y-8">
          {content.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">{s.title}</h2>
              <div className="space-y-2 text-gray-700 leading-relaxed">
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-cream/40 rounded-3xl p-8 text-center">
          <h3 className="font-display text-xl font-bold mb-2">Have a question?</h3>
          <p className="text-gray-600 mb-4">Our team is here to help. Contact us for more information.</p>
          <Link to="/contact" className="btn-primary">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
