import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder } from "../lib/payments";
import { markOrderPaid } from "../lib/orders";

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
        createOrder={async () => {
          const result = await createPayPalOrder({ orderId, orderNumber, total });
          if ("error" in result) {
            onError(result.error);
            throw new Error(result.error);
          }
          return result.paypalOrderId;
        }}
        onApprove={async (data) => {
          const result = await capturePayPalOrder(data.orderID, orderId);
          if (!result.success) {
            onError(result.error || "PayPal capture failed.");
            return;
          }
          await markOrderPaid(orderId);
          onSuccess();
        }}
        onError={() => onError("PayPal payment failed. Please try again.")}
      />
    </PayPalScriptProvider>
  );
}
