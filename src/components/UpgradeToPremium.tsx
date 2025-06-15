
import React from "react";
import { Button } from "@/components/ui/button";

// Provide your actual Paystack PUBLIC key here.
// NEVER use a secret key in frontend code! Your key should start with "pk_..."
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx"; // TODO: Replace with your real Paystack public key

const amountNGN = 2000; // Price in NGN, adjust as needed

const UpgradeToPremium = ({ userId }: { userId: string }) => {
  const handlePaystack = () => {
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.startsWith("sk_")) {
      alert(
        "Error: You must provide your Paystack PUBLIC key (starts with pk_...). Go to Paystack Dashboard > Settings > API Keys to get your public key."
      );
      return;
    }
    // Dynamically create Paystack script tag if not already present
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => payWithPaystack();
      document.body.appendChild(script);
    } else {
      payWithPaystack();
    }
  };

  function payWithPaystack() {
    // @ts-ignore
    const handler = window.PaystackPop && window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: window.sessionStorage.getItem("user_email") || "user@example.com", // Optionally store user email somewhere or prompt for it.
      amount: amountNGN * 100, // Kobo, so multiply by 100
      currency: "NGN",
      ref: `PREM-${userId}-${Date.now()}`,
      metadata: {
        user_id: userId
      },
      callback: function (response: any) {
        // Payment complete! Confirmation will come from webhook,
        // but you could optimistically update UI or show a spinner here
        alert("Payment completed! Activating Premium shortly. If not, contact support with your transaction reference: " + response.reference);
      },
      onClose: function () {
        // Payment window closed
      }
    });
    if (handler) handler.openIframe();
  }

  return (
    <div className="border rounded-lg p-6 bg-blue-50 flex flex-col items-center gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-1">Upgrade to Premium</h2>
      <p className="text-gray-600 mb-2 text-center">
        Unlock unlimited study sessions, advanced question generation, and more!<br />
        <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded mt-2">
          ₦{amountNGN} one-time payment
        </span>
      </p>
      <Button
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
        onClick={handlePaystack}
        disabled={!userId || !PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.startsWith("sk_")}
      >
        {(!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.startsWith("sk_")) ? "No Public Key Set" : "Upgrade Now"}
      </Button>
      <div className="text-xs text-gray-400 mt-2">
        Secure payments powered by Paystack.
      </div>
    </div>
  );
};

export default UpgradeToPremium;

