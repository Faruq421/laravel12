import { useState, useEffect, useRef, RefObject } from 'react';

// Opsi untuk Intersection Observer
interface ObserverOptions {
    threshold?: number;
    triggerOnce?: boolean;
}

export function useInView(options: ObserverOptions = {}): [RefObject<HTMLDivElement>, boolean] {
    const { threshold = 0.1, triggerOnce = true } = options;
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    // Jika hanya ingin animasi berjalan sekali, lepaskan observer
                    if (triggerOnce && ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            {
                threshold,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, threshold, triggerOnce]);

    return [ref, isInView];
}
