"use client";

import { useEffect, useRef, useState } from "react";

type Product = {
  id: string;
  index: string;
  name: string;
  faName: string;
  price: string;
  full: string;
  detail: string;
  description: string;
  note: string;
};

const products: Product[] = [
  {
    id: "tulips",
    index: "01",
    name: "TULIPS",
    faName: "قلیان تیولیپس",
    price: "۱٬۹۵۰٬۰۰۰ تومان",
    full: "/images/products/tulips/full.jpg",
    detail: "/images/products/tulips/detail.jpg",
    description: "فرم مجسمه‌وار و بازتاب طلایی؛ حضوری که پیش از اولین کام، میز را تعریف می‌کند.",
    note: "سرو ویژه هوکا · انتخاب طعم با مهمان",
  },
  {
    id: "wookah",
    index: "02",
    name: "WOOKAH",
    faName: "قلیان ووکا",
    price: "۱٬۴۰۰٬۰۰۰ تومان",
    full: "/images/products/wookah/full.jpg",
    detail: "/images/products/wookah/detail.jpg",
    description: "سیلوئت کشیده و جزئیات دست‌ساز؛ برداشتی مدرن از یک آیین آشنا برای شب‌های طولانی.",
    note: "سرو اختصاصی فرمونتی · طعم ترکیبی",
  },
  {
    id: "arabic",
    index: "03",
    name: "ARABIC",
    faName: "قلیان عربی",
    price: "۱٬۰۵۰٬۰۰۰ تومان",
    full: "/images/products/arabic/full.jpg",
    detail: "/images/products/arabic/detail.jpg",
    description: "بدنه کلاسیک، فلز گرم و شیشه شفاف؛ اصالت سرو عربی در قاب امروزی هوکا.",
    note: "سرو کلاسیک · طعم‌های سنتی منتخب",
  },
  {
    id: "economy",
    index: "04",
    name: "ECONOMY",
    faName: "قلیان اکونومی",
    price: "۸۵۰٬۰۰۰ تومان",
    full: "/images/products/economy/full.jpg",
    detail: "/images/products/economy/detail.jpg",
    description: "مینیمال، شفاف و بی‌تکلف؛ تجربه کامل هوکا با تمرکز روی طعم و ریتم میز.",
    note: "سرو روزانه · انتخاب طعم با مهمان",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export default function Home() {
  const [activeId, setActiveId] = useState("tulips");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const objectRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const active = products.find((product) => product.id === activeId) ?? products[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;

      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const distance = Math.max(heroRef.current.offsetHeight - viewport, 1);
        const progress = clamp(-rect.top / distance);
        document.documentElement.style.setProperty("--hero-p", progress.toFixed(4));
        setPastHero(progress > 0.72 || rect.bottom < viewport * 0.35);
      }

      if (objectRef.current) {
        const rect = objectRef.current.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / (viewport + rect.height));
        document.documentElement.style.setProperty("--object-p", progress.toFixed(4));
      }

      if (galleryRef.current && trackRef.current && window.innerWidth >= 760) {
        const rect = galleryRef.current.getBoundingClientRect();
        const distance = Math.max(galleryRef.current.offsetHeight - viewport, 1);
        const progress = clamp(-rect.top / distance);
        const travel = Math.max(trackRef.current.scrollWidth - window.innerWidth, 0);
        trackRef.current.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
      { threshold: 0.14 },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className={`loader ${ready ? "is-ready" : ""}`} aria-hidden="true">
        <p>HOOKA</p>
        <div><i /></div>
        <span>FERMONTEE · TEHRAN</span>
      </div>

      <header className={`topbar ${pastHero ? "is-light" : ""}`} aria-label="ناوبری اصلی">
        <button className="nav-box nav-menu" type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="site-menu">
          <span>MENU</span><i aria-hidden="true" /><i aria-hidden="true" />
        </button>
        <a className="wordmark" href="#top" aria-label="هوکا، بازگشت به ابتدا">HOOKA</a>
        <a className="nav-box nav-cta" href="#menu"><em>Explore</em> THE MENU</a>
      </header>

      <aside id="site-menu" className={`menu-overlay ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <button type="button" className="menu-close" onClick={() => setMenuOpen(false)}>CLOSE <span>×</span></button>
        <nav aria-label="فهرست صفحه">
          {[
            ["01", "INTRO", "#top"],
            ["02", "THE OBJECT", "#object"],
            ["03", "COLLECTION", "#collection"],
            ["04", "MENU", "#menu"],
          ].map(([number, label, href]) => (
            <a href={href} key={label} onClick={() => setMenuOpen(false)}>
              <small>{number}</small><span>{label}</span><b>↙</b>
            </a>
          ))}
        </nav>
        <div className="overlay-meta"><p>FERMONTEE · TEHRAN</p><p>A DIGITAL HOOKAH MENU</p></div>
      </aside>

      <main>
        <section className="hero-scroll" id="top" ref={heroRef} aria-labelledby="hero-title">
          <div className="hero-sticky">
            <div className="hero-frame">
              <picture>
                <source media="(max-width: 720px)" srcSet="/images/hero/hero-azure.jpg" />
                <img src="/images/hero/hero-wide.jpg" alt="قلیان مدرن هوکا در فضای شبانه فرمونتی" fetchPriority="high" />
              </picture>
              <div className="hero-vignette" />
              <h1 id="hero-title" className="sr-only">HOOKA — A ritual, reimagined.</h1>
              <div className="hero-mobile-title">
                <p>FERMONTEE PRESENTS</p><strong>HOO<em>K</em>A</strong><span>A ritual, reimagined.</span>
              </div>
              <p className="hero-side-note">A QUIET EXPERIENCE<br />FOR SLOWER NIGHTS.</p>
              <div className="hero-bottom"><span>SCROLL TO DISCOVER</span><i /><b>01 / 05</b></div>
            </div>
          </div>
        </section>

        <section className="object-intro" id="object" ref={objectRef} aria-labelledby="object-title">
          <div className="section-kicker" data-reveal><span>THE OBJECT</span><i /><span>جسم</span></div>
          <div className="object-title" data-reveal>
            <h2 id="object-title">A familiar ritual,<br /><em>made tangible.</em></h2>
            <p>در قلب شب، فرم و طعم به یک تجربه تبدیل می‌شوند؛ آرام، دقیق و به‌یادماندنی.</p>
          </div>

          <div className="object-composition">
            <p className="object-ghost" aria-hidden="true">THE OBJECT</p>
            <div className="object-copy" data-reveal>
              <span>PHASE 02</span>
              <p>این قاب در مرحله بعد میزبان مدل سه‌بعدی واقعی خواهد بود؛ ساختار صفحه برای فایل GLB و کنترل اسکرولی آماده است.</p>
            </div>
            <figure className="object-figure">
              <img src="/images/products/tulips/full.jpg" alt="قلیان تیولیپس به‌عنوان محصول شاخص هوکا" loading="lazy" />
            </figure>
            <div className="object-index"><span>OBJECT</span><b>01</b><small>HOOKA COLLECTION</small></div>
          </div>
        </section>

        <section className="manifesto" aria-label="مانیفست هوکا">
          <p className="section-kicker" data-reveal>THE ESSENCE OF HOOKA</p>
          <h2 data-reveal>where <em>FORM</em><br />meets RITUAL</h2>
          <figure data-reveal><img src="/images/editorial/spectrum.jpg" alt="جزئیات فرم و رنگ هوکا" loading="lazy" /></figure>
          <p className="manifesto-copy" data-reveal>هر انتخاب، روایتی متفاوت از یک مکث مشترک است.</p>
        </section>

        <section className="gallery-scroll" id="collection" ref={galleryRef} aria-label="مجموعه محصولات هوکا">
          <div className="gallery-sticky">
            <div className="gallery-header">
              <div className="section-kicker"><span>THE COLLECTION</span><i /><span>04 OBJECTS</span></div>
              <p>برای حرکت در مجموعه اسکرول کنید</p>
            </div>
            <div className="gallery-track" ref={trackRef}>
              <div className="gallery-opening">
                <small>HOOKA · 2026</small>
                <h2>Four ways<br /><em>to slow down.</em></h2>
              </div>
              {products.map((product) => (
                <a className="gallery-card" href="#menu" key={product.id} onClick={() => setActiveId(product.id)}>
                  <img src={product.full} alt={product.faName} loading="lazy" />
                  <div className="gallery-shade" />
                  <div className="card-top"><span>{product.index} / 04</span><span>{product.faName}</span></div>
                  <div className="card-title"><h3>{product.name}</h3><span>VIEW THE SERVE ↙</span></div>
                </a>
              ))}
              <div className="gallery-closing">
                <p>THE MENU</p><h2>Choose<br /><em>your ritual.</em></h2><span>04 SERVES · ONE NIGHT</span>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-title">
          <div className="section-kicker" data-reveal><span>HOOKA MENU</span><i /><span>FERMONTEE</span></div>
          <div className="menu-title" data-reveal>
            <h2 id="menu-title">SELECT<br /><em>your experience.</em></h2>
            <p>چهار انتخاب؛ از فرم مجسمه‌وار تا سرو کلاسیک.</p>
          </div>

          <div className="product-selector" role="tablist" aria-label="انتخاب مدل قلیان" data-reveal>
            {products.map((product) => (
              <button type="button" role="tab" aria-selected={active.id === product.id} className={active.id === product.id ? "is-active" : ""} key={product.id} onClick={() => setActiveId(product.id)}>
                <small>{product.index}</small><span>{product.name}</span><i>{product.faName}</i>
              </button>
            ))}
          </div>

          <div className="menu-product">
            <article className="product-info" key={`${active.id}-info`}>
              <div className="product-heading"><span>{active.index} / 04</span><h3>{active.name}</h3><p>{active.faName}</p></div>
              <p className="product-description">{active.description}</p>
              <div className="serve-detail">
                <img src={active.detail} alt={`جزئیات ${active.faName}`} />
                <div><span>THE SERVE</span><p>{active.note}</p></div>
              </div>
              <div className="product-price"><span>قیمت سرو</span><strong>{active.price}</strong></div>
            </article>
            <figure className="product-image" key={`${active.id}-image`}>
              <img src={active.full} alt={active.faName} />
              <figcaption><span>HOOKA / {active.index}</span><span>FERMONTEE · TEHRAN</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="closing-story" aria-label="گالری هوکا">
          <div className="closing-grid" data-reveal>
            <figure><img src="/images/editorial/lineup.jpg" alt="مجموعه مدل‌های هوکا" loading="lazy" /></figure>
            <figure><img src="/images/editorial/onyx.jpg" alt="مدل مشکی هوکا" loading="lazy" /></figure>
            <figure><img src="/images/editorial/spectrum.jpg" alt="مدل رنگی هوکا" loading="lazy" /></figure>
          </div>
          <blockquote data-reveal>Designed for the table.<br /><em>Remembered after the night.</em></blockquote>
        </section>
      </main>

      <footer>
        <div className="footer-meta"><span>FERMONTEE · TEHRAN</span><span>EST. 2026</span></div>
        <div className="footer-center">
          <p>THE NIGHT CAN WAIT.</p>
          <h2>HOO<em>K</em>A</h2>
          <span>تجربه‌ات را انتخاب کن.</span>
          <a href="#menu">EXPLORE THE MENU <b>↙</b></a>
        </div>
        <div className="footer-bottom"><span>© 2026 HOOKA</span><a href="#top">BACK TO TOP ↑</a><span>BY FERMONTEE</span></div>
      </footer>
    </>
  );
}
