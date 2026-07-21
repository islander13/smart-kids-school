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
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const stripe = await getStripe();
      if (!stripe || cancelled || !containerRef.current) return;
      checkoutInstance = await stripe.createEmbeddedCheckoutPage({
        clientSecret,
        // "checkoutRendered" est censé signaler la fin de l'affichage, mais
        // ne se déclenche pas de façon fiable dans tous les cas observés —
        // on s'en sert comme chemin rapide quand il arrive, sans en
        // dépendre : le filet de sécurité ci-dessous (fallbackTimer) garantit
        // que le spinner ne reste jamais bloqué indéfiniment.
        onAnalyticsEvent: (event) => {
          if (event.eventType === 'checkoutRendered' && !cancelled) setIsReady(true);
        },
      });
      if (cancelled) {
        checkoutInstance.destroy();
        return;
      }
      checkoutInstance.mount(containerRef.current);
      // Filet de sécurité : si le signal Stripe n'arrive pas, on retire le
      // spinner après un délai raisonnable plutôt que de le laisser bloqué.
      fallbackTimer = setTimeout(() => {
        if (!cancelled) setIsReady(true);
      }, 2500);
    })();

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
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
