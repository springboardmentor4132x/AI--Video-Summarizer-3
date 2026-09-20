import { useEffect, useState } from "react";

// Flips true shortly after mount, so a component can transition
// from "opacity-0 translate-y-4" to "opacity-100 translate-y-0".
// Pass a delay (ms) to stagger multiple items in a list.
export function useReveal(delay = 0) {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return revealed;
}