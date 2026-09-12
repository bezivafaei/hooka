"use client";

import type { CSSProperties } from "react";
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

const easeInOut = (value: number) => value * value * (3 - 2 * value);

type ClosingConfig = {
  multiplier: number;
};

const desktopConfig: ClosingConfig = {
  multiplier: 4.2,
};

const mobileConfig: ClosingConfig = {
  multiplier: 3.8,
};

function getConfig(): ClosingConfig {
  return typeof window !== "undefined" && window.innerWidth < 760 ? mobileConfig : desktopConfig;
}

/**
 * Clean 4-step timeline without any empty black void:
 * - Step 0 (0.00 -> 0.20): 100% visible immediately upon entering
 * - Crossfade 0 -> 1: (0.20 -> 0.28)
 * - Step 1 (0.28 -> 0.46): 100% visible
 * - Crossfade 1 -> 2: (0.46 -> 0.54)
 * - Step 2 (0.54 -> 0.72): 100% visible
 * - Crossfade 2 -> 3: (0.72 -> 0.80)
 * - Step 3 (0.80 -> 1.00+): 100% visible until footer scrolls over (no black screen at end)
 */
function stepFocus(progress: number, index: number) {
  if (index === 0) {
    if (progress <= 0.20) return 1;
    if (progress < 0.28) return easeInOut(clamp((0.28 - progress) / 0.08));
    return 0;
  }
  if (index === 1) {
    if (progress <= 0.20) return 0;
    if (progress < 0.28) return easeInOut(clamp((progress - 0.20) / 0.08));
    if (progress <= 0.46) return 1;
    if (progress < 0.54) return easeInOut(clamp((0.54 - progress) / 0.08));
    return 0;
  }
  if (index === 2) {
    if (progress <= 0.46) return 0;
    if (progress < 0.54) return easeInOut(clamp((progress - 0.46) / 0.08));
    if (progress <= 0.72) return 1;
    if (progress < 0.80) return easeInOut(clamp((0.80 - progress) / 0.08));
    return 0;
  }
  if (index === 3) {
    if (progress <= 0.72) return 0;
    if (progress < 0.80) return easeInOut(clamp((progress - 0.72) / 0.08));
    return 1; // Stays fully visible at end
  }
  return 0;
}

function stepScale(progress: number, index: number) {
  const centers = [0.10, 0.37, 0.63, 0.88];
  const dist = Math.abs(progress - centers[index]);
  const t = clamp(1 - dist / 0.20);
  return 1.0 + Math.sin(t * Math.PI) * 0.035;
}

function preloadImages() {
  return Promise.all(
    productSteps.map(
      (step) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.decoding = "async";
          const finish = () => resolve();
          image.onload = () => {
            if (typeof image.decode === "function") {
              image.decode().then(finish).catch(finish);
              return;
            }
            finish();
          };
          image.onerror = finish;
          image.src = step.src;
        }),
    ),
  );
}

export function ClosingGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageReadyRef = useRef<boolean[]>(productSteps.map(() => false));
  const configRef = useRef<ClosingConfig>(desktopConfig);
  const requestUpdateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let disposed = false;

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

      document.documentElement.style.setProperty("--closing-p", progress.toFixed(4));

      productSteps.forEach((_, index) => {
        const focus = stepFocus(progress, index);
        const visibleFocus = focus;
        const visual = visualRefs.current[index];
        const copy = copyRefs.current[index];
        const step = stepRefs.current[index];

        const scale = stepScale(progress, index);

        if (visual) {
          visual.style.opacity = visibleFocus.toFixed(3);
          visual.style.transform = `scale(${scale.toFixed(4)})`;
          visual.style.visibility = visibleFocus > 0.001 ? "visible" : "hidden";
        }

        if (copy) {
          copy.style.opacity = visibleFocus.toFixed(3);
          copy.style.transform = `translate3d(0, ${(1 - visibleFocus) * 8}px, 0)`;
          copy.classList.toggle("is-active", visibleFocus > 0.62);
        }

        if (step) {
          step.classList.toggle("is-active", visibleFocus > 0.62);
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

    const handleResize = () => {
      syncHeight();
      requestUpdate();
    };

    syncHeight();
    update();
    preloadImages().then(() => {
      if (disposed) return;
      imageReadyRef.current = productSteps.map(() => true);
      requestUpdate();
    });

    const prefetchMargin = `${Math.ceil(window.innerHeight * 1.2)}px 0px`;
    const prefetchObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        preloadImages();
        prefetchObserver.disconnect();
      },
      { rootMargin: prefetchMargin },
    );
    prefetchObserver.observe(section);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      prefetchObserver.disconnect();
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
                  imageReadyRef.current[index] = true;
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
