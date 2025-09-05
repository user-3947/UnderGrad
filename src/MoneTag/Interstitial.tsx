// File: src/components/InterstitialAd.tsx
import { useEffect } from "react";

const Interstitial = () => {
  useEffect(() => {
    // Remove existing script if already injected
    const existing = document.querySelector(
      "script[src='https://groleegni.net/vignette.min.js']"
    );
    if (existing) existing.remove();

    // Create a new script
    const script = document.createElement("script");
    script.src = "https://groleegni.net/vignette.min.js";
    script.async = true;
    script.dataset.zone = "9829945"; // 👈 Your Monetag zone ID

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null; // No UI, handled by Monetag
};

export default Interstitial;
