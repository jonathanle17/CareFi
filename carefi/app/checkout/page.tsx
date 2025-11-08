"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Lock, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [cardNumberError, setCardNumberError] = useState<string>("");
  const [expiryError, setExpiryError] = useState<string>("");
  const [cvcError, setCvcError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const prevExpiryRef = useRef<string>("");

  const orderItems = [
    { name: "Cetaphil Gentle Skin Cleanser", price: 11.99 },
    { name: "The Ordinary Niacinamide 10% + Zinc 1%", price: 6.0 },
    { name: "The Ordinary Azelaic Acid Suspension 10%", price: 12.0 },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const cardDigits = cardNumber.replace(/\s/g, "");
    const expiryDigits = expiry.replace(/\s/g, "").replace(/\//g, "");
    
    let isValid = true;
    
    if (cardDigits.length !== 16) {
      setCardNumberError("Card number must be 16 digits");
      isValid = false;
    }
    
    if (expiryDigits.length !== 4) {
      setExpiryError("Expiry date is required");
      isValid = false;
    } else {
      const month = parseInt(expiryDigits.slice(0, 2));
      if (month < 1 || month > 12) {
        setExpiryError("Month must be between 01 and 12");
        isValid = false;
      } else {
        setExpiryError("");
      }
    }
    
    if (cvc.length < 3) {
      setCvcError(true);
      isValid = false;
    } else {
      setCvcError(false);
    }
    
    if (name.trim().length === 0) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }
    
    if (!isValid) {
      return;
    }
    
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/summary");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Test checkout"
            title="Complete your order"
            subtitle="This is a test flow—no actual charges will be made."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-stone-600" />
                </div>
                <h3 className="text-xl font-display font-medium text-stone-900">
                  Payment details
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Card number
                  </label>
                  <Input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => {
                      // Only allow digits and spaces
                      const value = e.target.value.replace(/[^\d\s]/g, "");
                      // Format with spaces every 4 digits
                      const formatted = value
                        .replace(/\s/g, "")
                        .match(/.{1,4}/g)
                        ?.join(" ") || value.replace(/\s/g, "");
                      setCardNumber(formatted);
                      // Clear error when user starts typing
                      if (cardNumberError) {
                        setCardNumberError("");
                      }
                    }}
                    maxLength={19}
                    className={cardNumberError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {cardNumberError ? (
                    <p className="text-sm text-red-600 mt-1">{cardNumberError}</p>
                  ) : (
                    <p className="text-xs text-stone-500 mt-1">
                      Use test card: 4242 4242 4242 4242
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Expiry
                    </label>
                    <Input
                      type="text"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Only allow digits and the separator
                        const value = inputValue.replace(/[^\d\s/]/g, "").replace(/\s*\/\s*/g, "");
                        
                        // Check if user is deleting (input is getting shorter)
                        const isDeleting = value.length < prevExpiryRef.current.replace(/\s*\/\s*/g, "").length;
                        prevExpiryRef.current = value;
                        
                        // Format as MM / YY
                        let formatted = value;
                        if (value.length > 2) {
                          formatted = value.slice(0, 2) + " / " + value.slice(2, 4);
                          // Validate month when user has entered 2+ digits
                          const month = parseInt(value.slice(0, 2));
                          if (month > 12 || month < 1) {
                            setExpiryError("Month must be between 01 and 12");
                          } else {
                            setExpiryError("");
                          }
                        } else if (value.length === 2 && !isDeleting) {
                          // Only add " / " if user is typing, not deleting
                          formatted = value + " / ";
                          // Validate month when user has entered 2 digits
                          const month = parseInt(value);
                          if (month > 12 || month < 1) {
                            setExpiryError("Month must be between 01 and 12");
                          } else {
                            setExpiryError("");
                          }
                        } else {
                          setExpiryError("");
                        }
                        setExpiry(formatted);
                      }}
                      maxLength={7}
                      className={expiryError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                    {expiryError && (
                      <p className="text-sm text-red-600 mt-1">{expiryError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      CVC
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/[^\d]/g, "");
                        setCvc(value);
                        setCvcError(false);
                      }}
                      maxLength={4}
                      className={cvcError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cardholder name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      // Only allow letters and spaces
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setName(value);
                      setNameError(false);
                    }}
                    className={nameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white gap-2"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Place test payment
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-start gap-2 text-xs text-stone-500">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    This is a test checkout. No actual payment will be
                    processed. Your information is not stored.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-display font-medium text-stone-900">
                  Order summary
                </h3>

                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-900">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-stone-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-medium text-stone-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Tax (8%)</span>
                    <span className="font-medium text-stone-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-stone-200">
                    <span className="text-stone-900">Total</span>
                    <span className="text-stone-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-sm font-medium text-emerald-900 mb-1">
                      You're saving $76.01
                    </p>
                    <p className="text-xs text-emerald-700">
                      Compared to brand-name alternatives
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-display">
              Test payment successful!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-stone-600">
              No actual charge was made. This was a test checkout flow.
            </p>
            <Button
              onClick={handleSuccessClose}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white"
            >
              View your summary
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
