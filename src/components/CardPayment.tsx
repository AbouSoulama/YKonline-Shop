import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { getStripePublishableKey } from "../lib/payments";
import { markOrderPaid } from "../lib/orders";
import { formatPrice } from "../context/CartContext";

interface BillingDetails {
  name: string;
  email: string;
  phone?: string;
  address: { line1: string; city: string; country: string };
}

const stripeCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(pk: string) {
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk));
  return stripeCache.get(pk)!;
}

function CardForm({ orderId, orderNumber, total, billingDetails, onSuccess, onError }: {
  orderId: string;
  orderNumber: string;
  total: number;
  billingDetails: BillingDetails;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message || "Please check your payment details.");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}&email=${encodeURIComponent(billingDetails.email)}`,
        payment_method_data: {
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
            address: billingDetails.address,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await markOrderPaid(orderId, undefined, "stripe");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {!ready && (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <Loader2 size={18} className="animate-spin" /> Loading payment form...
        </div>
      )}
      <PaymentElement
        onReady={() => setReady(true)}
        options={{ layout: "tabs" }}
      />
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || !ready || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Pay {formatPrice(total)}
      </button>
    </div>
  );
}

export default function CardPayment({ clientSecret, orderId, orderNumber, total, billingDetails, onSuccess, onError }: {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  total: number;
  billingDetails: BillingDetails;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const pk = getStripePublishableKey();
  const stripePromise = useMemo(() => (pk ? getStripePromise(pk) : null), [pk]);

  if (!pk || !stripePromise) {
    return <p className="text-red-600 text-sm">Card payments require a valid Stripe publishable key (pk_test_...).</p>;
  }

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#0B6623", borderRadius: "12px" },
        },
      }}
    >
      <CardForm
        orderId={orderId}
        orderNumber={orderNumber}
        total={total}
        billingDetails={billingDetails}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
