import { useEffect, useRef, useState } from 'react';
import { getStripe } from './stripe';

// Encapsule le montage/démontage du formulaire de paiement Stripe intégré,
// pour que tarifs.tsx, stages.tsx et premium.tsx n'aient pas à répéter cette
// logique chacune de leur côté.
//
// Usage :
//   const checkout = useEmbeddedCheckout();
//   ...
//   checkout.start(clientSecret)              // après réponse de la fonction serveur
//   {checkout.isActive && (
//     <>
//       {!checkout.isReady && <Spinner />}
//       <div ref={checkout.containerRef} />
//     </>
//   )}
//   checkout.reset()                          // à la fermeture de la modal
export function useEmbeddedCheckout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientSecret) return;
    let cancelled = false;
    let checkoutInstance: { destroy: () => void; mount: (el: HTMLElement) => void } | undefined;

    (async () => {
      const stripe = await getStripe();
      if (!stripe || cancelled || !containerRef.current) return;
      checkoutInstance = await stripe.createEmbeddedCheckoutPage({
        clientSecret,
        // Signal fiable de Stripe (pas une estimation) : le formulaire a
        // fini de s'afficher, on peut retirer le spinner de chargement.
        onAnalyticsEvent: (event) => {
          if (event.eventType === 'checkoutRendered') setIsReady(true);
        },
      });
      if (cancelled) {
        checkoutInstance.destroy();
        return;
      }
      checkoutInstance.mount(containerRef.current);
    })();

    return () => {
      cancelled = true;
      checkoutInstance?.destroy();
    };
  }, [clientSecret]);

  return {
    containerRef,
    isActive: clientSecret !== null,
    isReady,
    start: (secret: string) => setClientSecret(secret),
    reset: () => {
      setClientSecret(null);
      setIsReady(false);
    },
  };
}
