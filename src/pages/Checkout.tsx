import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShoppingCart, CreditCard, Truck, Check } from 'lucide-react';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('your_stripe_publishable_key');

const CheckoutForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message || 'An error occurred. Please try again.');
      setLoading(false);
      return;
    }

    // Send payment and order information to your server
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: total * 100, // Convert to cents
          shippingInfo,
          items: cart,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        clearCart();
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={shippingInfo.name}
                onChange={handleShippingInfoChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingInfoChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
              <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
            </form>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Thank you for your purchase!</h2>
        <p>Your order has been successfully placed. You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
      <div className="flex justify-between mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <ShoppingCart className="mr-2" />
          <span>Cart</span>
        </div>
        <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Truck className="mr-2" />
          <span>Shipping</span>
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <CreditCard className="mr-2" />
          <span>Payment</span>
        </div>
      </div>
      {renderStep()}
    </div>
  );
};

const Checkout: React.FC = () => {
  const { cart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p>Add some items to your cart before checking out.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <ul className="space-y-4 mb-6">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-gray-600">by {item.artist}</p>
                </div>
                <span className="font-semibold">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="text-xl font-bold mb-6">Total: ${total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;