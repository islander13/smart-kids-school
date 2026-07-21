import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Charge Stripe.js une seule fois et réutilise la même instance partout
// (tarifs, stages, premium), plutôt que de la recharger à chaque modal.
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY manquante — le paiement intégré ne peut pas se charger.');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
