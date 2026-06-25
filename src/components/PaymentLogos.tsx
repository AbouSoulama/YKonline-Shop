function PaymentImg({ src, alt, className = "h-6", darkBg = false }: { src: string; alt: string; className?: string; darkBg?: boolean }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 shadow-sm ${darkBg ? "border-gray-800 bg-black" : "border-gray-200 bg-white"}`}>
      <img src={src} alt={alt} className={`${className} w-auto max-w-none object-contain`} />
    </div>
  );
}

export function VisaLogo({ className = "h-6" }: { className?: string }) {
  return <PaymentImg src="/payments/visa.svg" alt="Visa" className={className} />;
}

export function MastercardLogo({ className = "h-6" }: { className?: string }) {
  return <PaymentImg src="/payments/mastercard.svg" alt="Mastercard" className={className} />;
}

export function AmexLogo({ className = "h-6" }: { className?: string }) {
  return <PaymentImg src="/payments/amex.svg" alt="American Express" className={className} />;
}

export function CreditCardLogo({ className = "h-6" }: { className?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <VisaLogo className={className} />
      <MastercardLogo className={className} />
      <AmexLogo className={className} />
    </div>
  );
}

export function PayPalLogo({ className = "h-6" }: { className?: string }) {
  return <PaymentImg src="/payments/paypal.png" alt="PayPal" className={className} />;
}

export function StripeLogo({ className = "h-6" }: { className?: string }) {
  return <PaymentImg src="/payments/stripe.png" alt="Stripe" className={className} />;
}

export function PaymentMethodsBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <VisaLogo />
      <MastercardLogo />
      <AmexLogo />
      <PayPalLogo />
      <StripeLogo />
    </div>
  );
}
