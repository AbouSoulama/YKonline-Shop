import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder } from "../lib/payments";

export default function PayPalPayment({ orderId, orderNumber, total, onSuccess, onError }: {
  orderId: string;
  orderNumber: string;
  total: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const clientId = getPayPalClientId();
  if (!clientId) {
    return <p className="text-red-600 text-sm">PayPal is not configured. Add VITE_PAYPAL_CLIENT_ID to your environment.</p>;
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: "USD", intent: "capture" }}>
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 }}
        createOrder={async (_data, actions) => {
          const result = await createPayPalOrder({ orderId, orderNumber, total });
          if (!("error" in result)) return result.paypalOrderId;

          if (actions.order) {
            return actions.order.create({
              purchase_units: [{
                reference_id: orderId,
                description: `YKonline Shop order ${orderNumber}`,
                amount: { currency_code: "USD", value: total.toFixed(2) },
              }],
            });
          }

          onError(result.error);
          throw new Error(result.error);
        }}
        onApprove={async (data, actions) => {
          let captured = false;

          if (data.orderID) {
            const result = await capturePayPalOrder(data.orderID, orderId);
            captured = result.success;
          }

          if (!captured && actions.order) {
            const details = await actions.order.capture();
            captured = details?.status === "COMPLETED";
          }

          if (!captured) {
            onError("PayPal capture failed. Please try again.");
            return;
          }

          onSuccess();
        }}
        onError={() => onError("PayPal payment failed. Please try again.")}
      />
    </PayPalScriptProvider>
  );
}
