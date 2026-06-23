import { FormEvent, useState } from "react";
import { subscribeToNewsletter } from "../lib/newsletter";

interface SubscribeFormProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  layout?: "row" | "column";
  tone?: "dark" | "light";
}

export default function SubscribeForm({
  className = "",
  inputClassName = "flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none bg-white",
  buttonClassName = "bg-orange hover:bg-orange-dark text-white font-bold px-6 py-3 rounded-full transition-colors whitespace-nowrap",
  layout = "column",
  tone = "dark",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    const result = await subscribeToNewsletter(email);
    setMessage(result.message);
    setError(!result.success);
    if (result.success) setEmail("");
    setLoading(false);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className={`flex gap-3 ${layout === "row" ? "flex-col sm:flex-row" : "flex-col"} ${className}`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={inputClassName}
          disabled={loading}
        />
        <button type="submit" className={buttonClassName} disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${error
          ? tone === "dark" ? "text-red-200" : "text-red-600"
          : tone === "dark" ? "text-green-100" : "text-green"
        }`}>{message}</p>
      )}
    </div>
  );
}
