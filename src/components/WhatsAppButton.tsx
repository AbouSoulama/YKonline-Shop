import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/13012669830?text=Hello%20YKonline%20Shop%2C%20I%20have%20a%20question%20about%20your%20shea%20butter."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green hover:bg-green-dark text-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={26} />
      <span className="absolute inset-0 rounded-full animate-ping bg-green/50 -z-10" />
    </a>
  );
}
