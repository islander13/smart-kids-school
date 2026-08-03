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
  // Stripe.js peut échouer à charger (bloqueur de pub, réseau, CSP...) ou
  // stripe.createEmbeddedCheckoutPage() peut rejeter (clientSecret expiré,
  // etc.) — sans ce flag, ces cas laissaient le spinner tourner à l'infini,
  // sans aucun moyen pour le client de savoir que le paiement est bloqué.
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientSecret) return;
    let cancelled = false;
    let checkoutInstance: { destroy: () => void; mount: (el: HTMLElement) => void } | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const stripe = await getStripe();
      if (cancelled) return;
      if (!stripe) {
        setError(true);
        return;
      }
      if (!containerRef.current) return;
      try {
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
      } catch (err) {
        console.error('Échec de création du paiement Stripe embarqué:', err);
        if (!cancelled) setError(true);
        return;
      }
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
    error,
    start: (secret: string) => {
      setError(false);
      setClientSecret(secret);
    },
    reset: () => {
      setClientSecret(null);
      setIsReady(false);
      setError(false);
    },
  };
}
