export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/13012669830?text=Hello%20YKonline%20Shop%2C%20I%20have%20a%20question%20about%20your%20shea%20butter."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-3.5 shadow-xl hover:scale-110 transition-transform"
      aria-label="Contact on WhatsApp"
    >
      <img src="/icons/whatsapp.svg" alt="" className="h-8 w-8" aria-hidden="true" />
      <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/40 -z-10" />
    </a>
  );
}
