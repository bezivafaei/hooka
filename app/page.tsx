"use client";

import { useEffect, useRef, useState } from "react";
import { ClosingGallery } from "./closing-gallery";
import { ManifestoScroll } from "./manifesto-scroll";
import { TypeLine } from "./type-line";

type ProductSpec = {
  material: string;
  bodyStrength: string;
  duration: string;
};

type Product = {
  id: string;
  index: string;
  shortName: string;
  name: string;
  price: string;
  priceNum: number;
  full: string;
  detail: string;
  badge: string;
  description: string;
  note: string;
  detailText: string;
  specs: ProductSpec;
};

const products: Product[] = [
  {
    id: "tulips",
    index: "۰۱",
    shortName: "تیولیپس",
    name: "قلیان آنیما تیولیپس",
    price: "۱٬۹۵۰٬۰۰۰ تومان",
    priceNum: 1950000,
    full: "/images/products/tulips/full.webp",
    detail: "/images/products/tulips/detail.jpg",
    badge: "لوکس‌ترین سرو",
    description: "فرمی مجسمه‌وار با تاج طلایی دست‌ساز؛ شاهکار طراحی با بازتاب طلایی که شخصیت و شکوه میز را کامل می‌کند.",
    note: "سرو لوکس فرمونتی · آبکاری طلا ۲۴ عیار",
    detailText: "تاج برنجی با آبکاری طلای ۲۴ عیار، بدنه صیقلی دودی و کام‌دهی فوق‌العاده نرم",
    specs: {
      material: "برنج طلاکاری ۲۴ عیار و شیشه پیرکس",
      bodyStrength: "پرحجم و مخملی",
      duration: "۱۲۰ دقیقه ماندگاری کام",
    },
  },
  {
    id: "wookah",
    index: "۰۲",
    shortName: "ووکا",
    name: "قلیان چوبی ووکا",
    price: "۱٬۴۵۰٬۰۰۰ تومان",
    priceNum: 1450000,
    full: "/images/products/wookah/full.webp",
    detail: "/images/products/wookah/detail.jpg",
    badge: "دست‌ساز اروپایی",
    description: "خطوط کشیده، بدنه چوب طبیعی و کریستال سنگین دست‌ساز تراش‌خورده؛ بازخوانی معاصر از سروی اصیل و باوقار.",
    note: "سرو اختصاصی ووکا · اتصالات استیل ۳۱۶",
    detailText: "نقوش منبت چوب طبیعی، سوپاپ مخفی، اتصالات استیل ۳۱۶ و امضای ووکا",
    specs: {
      material: "چوب طبیعی بلوط و کریستال تراش الماس",
      bodyStrength: "متوسط و عمیق",
      duration: "۱۱۰ دقیقه ماندگاری کام",
    },
  },
  {
    id: "arabic",
    index: "۰۳",
    shortName: "عربی",
    name: "قلیان عربی کلاسیک",
    price: "۱٬۰۵۰٬۰۰۰ تومان",
    priceNum: 1050000,
    full: "/images/products/arabic/full.webp",
    detail: "/images/products/arabic/detail.jpg",
    badge: "اصیل و سنگین",
    description: "بدنه برنجی کلاسیک با قلم‌زنی سنتی، فلز گرم و شیشه هفت‌رنگ شفاف؛ اصالت و خاطره نوستالژیک در فضایی مدرن.",
    note: "سرو کلاسیک خاورمیانه‌ای · قلم‌زنی دستی",
    detailText: "قلم‌زنی دست‌ساز فلز گرم برنجی، شلنگ سنتی چرمی و شیوه دود عمیق",
    specs: {
      material: "برنج ریخته‌گری دست‌ساز و شیشه متالیک",
      bodyStrength: "سنگین و دودی",
      duration: "۹۰ دقیقه ماندگاری کام",
    },
  },
  {
    id: "economy",
    index: "۰۴",
    shortName: "اکونومی",
    name: "قلیان مدرن اکونومی",
    price: "۸۵۰٬۰۰۰ تومان",
    priceNum: 850000,
    full: "/images/products/economy/full.webp",
    detail: "/images/products/economy/detail.jpg",
    badge: "شفاف و مینیمال",
    description: "ارگونومیک و تماماً شفاف؛ متمرکز بر خلوص عطر میوه‌ها با کام‌دهی سبک و روان بدون ذره‌ای اغراق.",
    note: "سرو مدرن · مخزن پیرکس مقاوم",
    detailText: "بدنه پیرکس مقاوم به شوک حرارتی، سوپاپ روان و لوله صیقلی استیل",
    specs: {
      material: "شیشه پیرکس فشرده و استیل ۳۰۴",
      bodyStrength: "سبک و روان",
      duration: "۸۰ دقیقه ماندگاری کام",
    },
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export default function Home() {
  const [activeId, setActiveId] = useState<string>("tulips");
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([
    "ترکیب ویژه فرمونتی",
    "شب‌های مسکو",
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [headerOnDark, setHeaderOnDark] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const active = products.find((product) => product.id === activeId) ?? products[0];

  const selectProduct = (productId: string) => {
    setActiveId(productId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Ensure horizontal swipe is dominant and exceeds threshold (40px)
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        const currentIndex = products.findIndex((p) => p.id === activeId);
        if (deltaX < 0) {
          // Swipe to left -> next model
          const nextIndex = (currentIndex + 1) % products.length;
          selectProduct(products[nextIndex].id);
        } else {
          // Swipe to right -> prev model
          const prevIndex = (currentIndex - 1 + products.length) % products.length;
          selectProduct(products[prevIndex].id);
        }
      }
    }
  };

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors((current) => {
      if (current.includes(flavor)) {
        return current.length > 1 ? current.filter((item) => item !== flavor) : current;
      }
      return current.length < 2 ? [...current, flavor] : [current[1], flavor];
    });
  };

  useEffect(() => {
    for (const src of [
      "/images/editorial/lineup.jpg",
      "/images/editorial/onyx.jpg",
      "/images/products/arabic/detail.jpg",
    ]) {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    }
  }, []);

  useEffect(() => {
    const motion = {
      targetHero: 0,
      currentHero: 0,
    };
    let frame = 0;
    let previousTime = performance.now();
    let previousPastHero = false;
    let previousHeaderOnDark = false;
    const darkHeaderSections = Array.from(
      document.querySelectorAll<HTMLElement>(".manifesto-scroll, .closing-scroll, footer"),
    );

    const measure = () => {
      const viewport = window.innerHeight;

      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const distance = Math.max(heroRef.current.offsetHeight - viewport, 1);
        motion.targetHero = clamp(-rect.top / distance);
        const nextPastHero = motion.targetHero > 0.62 || rect.bottom < viewport * 0.35;
        if (nextPastHero !== previousPastHero) {
          previousPastHero = nextPastHero;
          setPastHero(nextPastHero);
        }
      }

      const headerProbe = 48;
      const nextHeaderOnDark = darkHeaderSections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= headerProbe && rect.bottom >= headerProbe;
      });
      if (nextHeaderOnDark !== previousHeaderOnDark) {
        previousHeaderOnDark = nextHeaderOnDark;
        setHeaderOnDark(nextHeaderOnDark);
      }
    };

    const render = (time: number) => {
      const delta = Math.min(Math.max(time - previousTime, 1), 40);
      previousTime = time;
      const sceneEase = 1 - Math.exp(-delta / 175);
      const isMobileHero = window.innerWidth < 760;
      const heroSceneEase = isMobileHero ? 1 - Math.exp(-delta / 100) : sceneEase;
      motion.currentHero += (motion.targetHero - motion.currentHero) * heroSceneEase;

      const heroShrink = isMobileHero
        ? 1 - (1 - motion.currentHero) ** 1.85
        : motion.currentHero;
      const heroStretch = isMobileHero ? Math.sin(motion.currentHero * Math.PI) * 0.07 : 0;

      if (heroRef.current) {
        heroRef.current.style.setProperty("--hero-p", motion.currentHero.toFixed(4));
        heroRef.current.style.setProperty("--hero-shrink", heroShrink.toFixed(4));
        heroRef.current.style.setProperty("--hero-stretch", heroStretch.toFixed(4));
      }

      const moving = Math.abs(motion.targetHero - motion.currentHero) > 0.0005;
      frame = moving ? window.requestAnimationFrame(render) : 0;
    };

    const requestUpdate = () => {
      measure();
      if (!frame) {
        previousTime = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        }),
      { threshold: 0.04, rootMargin: "0px 0px 80px 0px" },
    );
    document.querySelectorAll("[data-reveal], [data-type]").forEach((element) => observer.observe(element));

    let initialWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const handleResize = () => {
      if (Math.abs(window.innerWidth - initialWidth) > 50) {
        initialWidth = window.innerWidth;
        requestUpdate();
      }
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`topbar ${pastHero ? "is-light is-past-hero" : ""} ${headerOnDark ? "is-dark" : ""}`} aria-label="ناوبری اصلی">
        <button className="nav-box nav-menu" type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="site-menu">
          <span>فهرست</span><i aria-hidden="true" /><i aria-hidden="true" />
        </button>
        <a className="wordmark" href="#top" aria-label="هوکا، بازگشت به ابتدا">هوکا</a>
        <a className="nav-box nav-cta" href="#menu">منوی هوکا</a>
      </header>

      <aside id="site-menu" className={`menu-overlay ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <button type="button" className="menu-close" onClick={() => setMenuOpen(false)}>بستن <span>×</span></button>
        <nav aria-label="فهرست صفحه">
          {[
            ["۰۱", "معرفی هوکا", "#top"],
            ["۰۲", "چرخش تعاملی و طعم‌ها", "#experience"],
            ["۰۳", "منوی مدل‌ها و طعم‌ها", "#menu"],
            ["۰۴", "آیین آماده‌سازی", "#ritual"],
            ["۰۵", "تماس و اطلاعات", "#contact"],
          ].map(([number, label, href]) => (
            <a href={href} key={label} onClick={() => setMenuOpen(false)}>
              <small>{number}</small><span>{label}</span><b>↙</b>
            </a>
          ))}
        </nav>
        <div className="overlay-meta"><p>فرمونتی · تهران</p><p>منوی دیجیتال · هوکا</p></div>
      </aside>

      <main>
        <section className="hero-scroll" id="top" ref={heroRef} aria-labelledby="hero-title">
          <div className="hero-sticky">
            <div className="hero-frame">
              <img
                src="/images/hero/hero-azure.webp"
                alt="قلیان مدرن هوکا در فضای شبانه فرمونتی"
                width={1601}
                height={2400}
                decoding="async"
                fetchPriority="high"
              />
              <div className="hero-vignette" />
              <div className="hero-title is-visible" id="hero-title" data-type>
                <p className="hero-brand">هوکا</p>
                <p className="hero-kicker">فرمونتی · تهران</p>
                <h1>
                  <TypeLine>مکثی آرام برای شب‌هایی</TypeLine>
                  <TypeLine delay={120}>که عجله ندارند.</TypeLine>
                </h1>
                <p className="hero-tagline">منو دیجیتال هوکا</p>
              </div>
              <div className="hero-bottom"><b>۰۱ / ۰۵</b></div>
              <div className="hero-shrink-meta" aria-hidden="true"><span>هوکا / فرمونتی</span><span>تهران · ۱۴۰۵</span></div>
            </div>
          </div>
        </section>

        <ManifestoScroll />

        <section className="menu-section menu-fullscreen-section" id="menu" aria-labelledby="menu-title">
          {/* Unified Full-Screen Editorial Canvas Card */}
          <div
            className="menu-unified-fullscreen-card"
            key={active.id}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Full-Bleed Image */}
            <div className="menu-canvas-bg">
              <img
                src={active.full}
                alt={`قلیان ${active.name}`}
                width={1600}
                height={2000}
                loading="eager"
                decoding="async"
              />
              <div className="menu-canvas-overlay-top" aria-hidden="true" />
              <div className="menu-canvas-overlay-bottom" aria-hidden="true" />
            </div>

            {/* Top Integrated Editorial Header Directly on Image Canvas */}
            <div className="menu-canvas-topbar">
              <div className="canvas-header-text">
                <span className="menu-canvas-kicker">منوی دیجیتال · فرمونتی تهران</span>
                <h2 className="menu-canvas-title" id="menu-title">
                  انتخاب مدل و سرو
                </h2>
              </div>
              <span className="showcase-counter">{active.index} / ۰۴</span>
            </div>

            {/* Side Prev / Next Arrows directly on Image */}
            <button
              type="button"
              className="canvas-nav-arrow canvas-nav-prev"
              onClick={() => {
                const currentIndex = products.findIndex((p) => p.id === active.id);
                const prevIndex = (currentIndex - 1 + products.length) % products.length;
                selectProduct(products[prevIndex].id);
              }}
              aria-label="مدل قبلی"
            >
              <span aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              className="canvas-nav-arrow canvas-nav-next"
              onClick={() => {
                const currentIndex = products.findIndex((p) => p.id === active.id);
                const nextIndex = (currentIndex + 1) % products.length;
                selectProduct(products[nextIndex].id);
              }}
              aria-label="مدل بعدی"
            >
              <span aria-hidden="true">‹</span>
            </button>

            {/* Bottom Integrated Editorial Glass Card DIRECTLY on Image */}
            <div className="menu-canvas-bottom-panel">
              {/* Floating Glass Model Switcher Tabs */}
              <nav className="photo-model-switcher" role="tablist" aria-label="انتخاب مدل قلیان">
                {products.map((product) => {
                  const isSelected = active.id === product.id;
                  return (
                    <button
                      type="button"
                      key={product.id}
                      role="tab"
                      aria-selected={isSelected}
                      className={`model-glass-tab ${isSelected ? "is-active" : ""}`}
                      onClick={() => selectProduct(product.id)}
                    >
                      <span className="tab-idx">{product.index}</span>
                      <span className="tab-name">{product.shortName}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Single-Line Product Title & Price directly inside the Image Panel */}
              <div className="model-single-row">
                <h3 className="model-main-title">{active.name}</h3>
                <div className="model-price-box">
                  <span className="model-price-label">سرو با پذیرایی:</span>
                  <strong className="model-price-num">{active.price}</strong>
                </div>
              </div>

              {/* Tobacco Flavor Selection Chips inside the Glass Panel */}
              <div className="card-flavors-row">
                <div className="flavors-bar-head">
                  <span className="flavors-bar-title">طعم‌های منتخب (تا ۲ مورد):</span>
                  <span className="flavors-bar-count">{selectedFlavors.length} از ۲ مورد</span>
                </div>
                <div className="flavors-chips-grid">
                  {[
                    "ترکیب ویژه فرمونتی",
                    "شب‌های مسکو",
                    "لاو ۶۶",
                    "دوسیب فاخر",
                    "بلوبری یخ",
                    "انگور نعناع",
                    "پرتقال نعناع",
                    "هندوانه یخ",
                  ].map((flavor) => {
                    const isSelected = selectedFlavors.includes(flavor);
                    return (
                      <button
                        type="button"
                        key={flavor}
                        className={`flavor-mini-chip ${isSelected ? "is-selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => toggleFlavor(flavor)}
                      >
                        <span className="chip-check">{isSelected ? "✓" : "+"}</span>
                        <span className="chip-text">{flavor}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ClosingGallery />
      </main>

      <footer id="contact" className="footer-minimal">
        <div className="footer-minimal-inner">
          <div className="footer-minimal-brand">
            <span className="footer-mini-kicker">فرمونتی · تهران</span>
            <h2 className="footer-mini-title">وقت مکث است.</h2>
          </div>

          {/* Social & Contact Only: Instagram and Direct Call */}
          <nav className="footer-icon-bar" aria-label="راه‌های ارتباط با سالن فرمونتی">
            <a
              href="tel:+989912221025"
              className="footer-icon-pill"
              aria-label="تماس تلفنی با سالن فرمونتی"
            >
              <span className="icon-circle">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span className="pill-text" dir="ltr">۰۹۹۱ ۲۲۲ ۱۰۲۵</span>
            </a>

            <a
              href="https://www.instagram.com/fermontee.restaurant/"
              target="_blank"
              rel="noreferrer"
              className="footer-icon-pill"
              aria-label="صفحه اینستاگرام رستوران فرمونتی"
            >
              <span className="icon-circle">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
              <span className="pill-text">اینستاگرام فرمونتی</span>
            </a>
          </nav>

          <div className="footer-minimal-details">
            <p>شهرک غرب، خیابان ایران‌زمین، خیابان مهستان، نبش کوچه دوم</p>
            <span className="detail-dot" aria-hidden="true">·</span>
            <p>پذیرایی: همه‌روزه از ۸:۰۰ صبح الی ۲۴:۰۰ بامداد</p>
          </div>

          <div className="footer-bottom-minimal">
            <span>© ۱۴۰۵ هوکا · مجموعه رستوران فرمونتی</span>
            <a href="#top" className="footer-back-link">
              <span>بازگشت به بالا</span>
              <b aria-hidden="true">↑</b>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
