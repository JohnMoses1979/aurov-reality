import { useState } from 'react';

import PrimaryButton from '../ui/PrimaryButton.js';
import { razorpayApi } from '../../services/api.js';

const RAZORPAY_SCRIPT_ID = 'aurov-razorpay-checkout';

function ensureRazorpayLoaded() {
  if (window.Razorpay) return Promise.resolve(true);

  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

export default function RazorpayPaymentButton({
  amount,
  bookingId,
  propertyId,
  ventureId,
  customerName,
  phone,
  email,
  onSuccess,
  onError,
  disabled,
  children = 'Pay Now',
}) {
  const [loading, setLoading] = useState(false);

  const openRazorpay = async () => {
    if (!amount || Number(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    if (!customerName || !phone) {
      onError?.('Customer name and phone are required');
      return;
    }

    try {
      setLoading(true);
      await ensureRazorpayLoaded();

      const order = await razorpayApi.createOrder({
        bookingId: bookingId || null,
        propertyId: propertyId || null,
        ventureId: ventureId || null,
        customerName,
        phone,
        email,
        amount: Number(amount),
      });

      const options = {
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: 'Aurov Reality',
        description: 'Property Booking Payment',
        order_id: order.orderId,

        prefill: {
          name: order.customerName || customerName,
          email: order.email || email,
          contact: order.phone || phone,
        },

        theme: {
          color: '#0B3D91',
        },

        handler: async function (response) {
          try {
            const verifyResult = await razorpayApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verifyResult.success) {
              onError?.(verifyResult.message || 'Payment verification failed');
              return;
            }

            onSuccess?.(verifyResult);
          } catch (err) {
            onError?.(err.message || 'Payment verification failed');
          }
        },

        modal: {
          ondismiss: function () {
            onError?.('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      onError?.(err.message || 'Unable to start payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryButton
      type="button"
      variant="green"
      className="w-full"
      onClick={openRazorpay}
      disabled={disabled || loading}
    >
      {loading ? 'Opening Payment...' : children}
    </PrimaryButton>
  );
}
