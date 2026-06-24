import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { getStripePublishableKey } from "../lib/payments";
import { markOrderPaid } from "../lib/orders";
import { formatPrice } from "../context/CartContext";

function CardForm({ orderId, total, onSuccess, onError }: {
  orderId: string;
  total: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?order=${orderId}` },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await markOrderPaid(orderId);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <button type="button" onClick={handlePay} disabled={!stripe || loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <Loader2 size={18} className="animate-spin" />}
        Pay {formatPrice(total)}
      </button>
    </div>
  );
}

export default function CardPayment({ clientSecret, orderId, total, onSuccess, onError }: {
  clientSecret: string;
  orderId: string;
  total: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const pk = getStripePublishableKey();
  if (!pk) return <p className="text-red-600 text-sm">Card payments require a valid Stripe publishable key (pk_test_...).</p>;

  const stripePromise = loadStripe(pk);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#0B6623" } } }}>
      <CardForm orderId={orderId} total={total} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
