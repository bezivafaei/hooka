"use client";

import { useEffect, useRef } from "react";
import { setStyleIfChanged } from "./observe-resize";

type ProductStep = {
  index: string;
  name: string;
  subtitle: string;
  line: string;
  src: string;
  alt: string;
};

const productSteps: ProductStep[] = [
  {
    index: "۰۱",
    name: "آغاز شب",
    subtitle: "Night Gatherings",
    line: "برای شروعِ گپ‌های طولانی با رفقا.",
    src: "/images/closing/closing-01.webp",
    alt: "آیین شب‌های هوکا در فرمونتی",
  },
  {
    index: "۰۲",
    name: "دورهمی دوستانه",
    subtitle: "Midnight Laughs",
    line: "خنده‌هایی که فقط حوالی نیمه‌شب سر می‌رسند.",
    src: "/images/closing/closing-02.webp",
    alt: "دورهمی دوستانه شبانه در فرمونتی",
  },
  {
    index: "۰۳",
    name: "مکث آرام",
    subtitle: "Timeless Moments",
    line: "وقتی صحبت‌ها گل می‌اندازد و زمان گم می‌شود.",
    src: "/images/closing/closing-03.webp",
    alt: "مکث آرام و لحظات ماندگار شب",
  },
  {
    index: "۰۴",
    name: "شب‌های ماندگار",
    subtitle: "Fermontee Nights",
    line: "شب‌هایی در فرمونتی که دلت نمی‌خواهد تمام شوند.",
    src: "/images/closing/closing-04.webp",
    alt: "شب‌های به یادماندنی در فرمونتی تهران",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

// Smooth Hermite interpolation for cinema-like dissolve transitions
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001));
  return t * t * (3 - 2 * t);
};

type ClosingConfig = {
  multiplier: number;
};

const desktopConfig: ClosingConfig = {
  multiplier: 3.0,
};

const mobileConfig: ClosingConfig = {
  multiplier: 2.6,
};

function getConfig(): ClosingConfig {
  return typeof window !== "undefined" && window.innerWidth < 760 ? mobileConfig : desktopConfig;
}

/**
 * High-end Cinema Dissolve Timeline:
 * - Step 0: Fully visible (0.00 -> 0.22), smoothly crossfades out to Step 1 (0.22 -> 0.38)
 * - Step 1: Smoothly crossfades in (0.22 -> 0.38), peak hold (0.38 -> 0.48), crossfades out (0.48 -> 0.64)
 * - Step 2: Smoothly crossfades in (0.48 -> 0.64), peak hold (0.64 -> 0.74), crossfades out (0.74 -> 0.88)
 * - Step 3: Smoothly crossfades in (0.74 -> 0.88), remains 100% visible through end (0.88 -> 1.00+)
 */
function stepFocus(progress: number, index: number) {
  if (index === 0) {
    if (progress <= 0.22) return 1;
    if (progress < 0.38) return 1 - smoothstep(0.22, 0.38, progress);
    return 0;
  }
  if (index === 1) {
    if (progress <= 0.22) return 0;
    if (progress < 0.38) return smoothstep(0.22, 0.38, progress);
    if (progress <= 0.48) return 1;
    if (progress < 0.64) return 1 - smoothstep(0.48, 0.64, progress);
    return 0;
  }
  if (index === 2) {
    if (progress <= 0.48) return 0;
    if (progress < 0.64) return smoothstep(0.48, 0.64, progress);
    if (progress <= 0.74) return 1;
    if (progress < 0.88) return 1 - smoothstep(0.74, 0.88, progress);
    return 0;
  }
  if (index === 3) {
    if (progress <= 0.74) return 0;
    if (progress < 0.88) return smoothstep(0.74, 0.88, progress);
    return 1;
  }
  return 0;
}

function stepScale(progress: number, index: number) {
  const centers = [0.11, 0.43, 0.69, 0.94];
  const dist = Math.abs(progress - centers[index]);
  const t = clamp(1 - dist / 0.24);
  return 1.0 + Math.sin(t * Math.PI) * 0.024;
}

// Immediate eager preloader for instant zero-lag gallery display
let cachedClosingImages: HTMLImageElement[] | null = null;
function preloadAllClosingImages() {
  if (cachedClosingImages) return;
  if (typeof window === "undefined") return;

  cachedClosingImages = productSteps.map((step) => {
    const image = new Image();
    image.decoding = "async";
    image.src = step.src;
    if (typeof image.decode === "function") {
      image.decode().catch(() => {});
    }
    return image;
  });
}

export function ClosingGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const configRef = useRef<ClosingConfig>(desktopConfig);
  const requestUpdateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let disposed = false;

    // Immediately kick off image fetching & GPU decode
    preloadAllClosingImages();

    const syncHeight = () => {
      configRef.current = getConfig();
      setStyleIfChanged(
        section,
        "height",
        `${Math.ceil(window.innerHeight * configRef.current.multiplier)}px`,
      );
    };

    const update = () => {
      const viewport = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - viewport, 1);
      const progress = clamp(-rect.top / travel);

      productSteps.forEach((_, index) => {
        const visibleFocus = stepFocus(progress, index);
        const visual = visualRefs.current[index];
        const copy = copyRefs.current[index];
        const step = stepRefs.current[index];

        const scale = stepScale(progress, index);

        if (visual) {
          visual.style.opacity = visibleFocus.toFixed(3);
          visual.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, 0, 0) translateZ(0)`;
          visual.style.visibility = visibleFocus > 0.001 ? "visible" : "hidden";
        }

        if (copy) {
          copy.style.opacity = visibleFocus.toFixed(3);
          copy.style.transform = `translate3d(0, ${((1 - visibleFocus) * 10).toFixed(1)}px, 0)`;
          copy.classList.toggle("is-active", visibleFocus > 0.55);
        }

        if (step) {
          step.classList.toggle("is-active", visibleFocus > 0.55);
        }
      });
    };

    const requestUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    requestUpdateRef.current = requestUpdate;

    let initialWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const handleResize = () => {
      if (Math.abs(window.innerWidth - initialWidth) > 50) {
        initialWidth = window.innerWidth;
        syncHeight();
        requestUpdate();
      }
    };

    syncHeight();
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (raf) window.cancelAnimationFrame(raf);
      section.style.removeProperty("height");
    };
  }, []);

  return (
    <section className="closing-scroll" id="ritual" ref={sectionRef} aria-label="مدل‌های اختصاصی هوکا">
      <div className="closing-sticky">
        <div className="closing-stage" aria-hidden="true">
          {productSteps.map((step, index) => (
            <figure
              className="closing-visual"
              key={step.src}
              style={{
                opacity: index === 0 ? 1 : 0,
                visibility: index === 0 ? "visible" : "hidden",
              }}
              ref={(element) => {
                visualRefs.current[index] = element;
              }}
            >
              <img
                src={step.src}
                alt={step.alt}
                width={1044}
                height={1600}
                loading="eager"
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                onLoad={() => {
                  requestUpdateRef.current();
                }}
              />
            </figure>
          ))}
          <div className="closing-vignette" />
        </div>

        <div className="closing-steps" aria-live="polite">
          {productSteps.map((step, index) => (
            <div
              className="closing-step"
              key={step.name}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
            >
              <div
                className={`closing-step-copy ${index === 0 ? "is-active" : ""}`}
                style={{ opacity: index === 0 ? 1 : 0 }}
                ref={(element) => {
                  copyRefs.current[index] = element;
                }}
              >
                <p className="closing-step-meta">
                  <span>{step.index} / ۰۴</span>
                  <i />
                  <span>{step.name}</span>
                </p>
                <p className="closing-step-line">{step.line}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
