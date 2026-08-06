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
    description:
      "فرم مجسمه‌وار، بازتاب طلایی و حضوری که پیش از اولین کام، میز را تعریف می‌کند.",
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
    description:
      "سیلوئت کشیده و جزئیات دست‌ساز؛ برداشتی مدرن از یک آیین آشنا برای شب‌های طولانی.",
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
    description:
      "بدنه کلاسیک، فلز گرم و شیشه شفاف؛ اصالت سرو عربی در قاب امروزی هوکا.",
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
    description:
      "مینیمال، شفاف و بی‌تکلف؛ تجربه کامل هوکا با تمرکز روی طعم و ریتم میز.",
    note: "سرو روزانه · انتخاب طعم با مهمان",
  },
];

const gallery = [
  {
    ...products[0],
    image: "/images/products/tulips/full.jpg",
    tone: "FORM / 01",
  },
  {
    ...products[1],
    image: "/images/products/wookah/full.jpg",
    tone: "CRAFT / 02",
  },
  {
    ...products[2],
    image: "/images/products/arabic/full.jpg",
    tone: "HERITAGE / 03",
  },
  {
    ...products[3],
    image: "/images/products/economy/full.jpg",
    tone: "ESSENTIAL / 04",
  },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const [activeId, setActiveId] = useState("tulips");
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = products.find((product) => product.id === activeId) ?? products[0];

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const hero = heroRef.current;
      const gallerySection = galleryRef.current;
      const track = galleryTrackRef.current;

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const distance = Math.max(hero.offsetHeight - viewport, 1);
        const progress = clamp(-rect.top / distance);
        document.documentElement.style.setProperty("--hero-progress", progress.toFixed(4));
      }

      if (gallerySection && track && window.innerWidth >= 760) {
        const rect = gallerySection.getBoundingClientRect();
        const distance = Math.max(gallerySection.offsetHeight - viewport, 1);
        const progress = clamp(-rect.top / distance);
        const travel = Math.max(track.scrollWidth - window.innerWidth, 0);
        track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
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

  const moveStage = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stageRef.current.style.setProperty("--tilt-x", `${x * 7}deg`);
    stageRef.current.style.setProperty("--tilt-y", `${y * -5}deg`);
  };

  const resetStage = () => {
    stageRef.current?.style.setProperty("--tilt-x", "0deg");
    stageRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  const closeAndGo = () => setMenuOpen(false);

  return (
    <>
      <header className="topbar" aria-label="ناوبری اصلی">
        <button
          className="menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(true)}
        >
          <span>MENU</span>
          <span className="menu-lines" aria-hidden="true"><i /><i /></span>
        </button>
        <a className="wordmark" href="#top" aria-label="هوکا، بازگشت به ابتدا">
          HOOKA
        </a>
        <a className="menu-cta" href="#menu">
          <span>VIEW THE</span> MENU
        </a>
      </header>

      <div id="site-menu" className={`menu-overlay ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <button className="menu-close" type="button" onClick={() => setMenuOpen(false)} aria-label="بستن منو">
          CLOSE <span aria-hidden="true">×</span>
        </button>
        <nav aria-label="فهرست صفحه">
          {[
            ["01", "INTRO", "#top"],
            ["02", "OBJECT", "#object"],
            ["03", "COLLECTION", "#collection"],
            ["04", "MENU", "#menu"],
          ].map(([number, label, href]) => (
            <a key={label} href={href} onClick={closeAndGo}>
              <small>{number}</small><span>{label}</span><b aria-hidden="true">↙</b>
            </a>
          ))}
        </nav>
        <p>FERMONTEE · TEHRAN<br />A DIGITAL HOOKAH MENU</p>
      </div>

      <main>
        <section className="hero-scroll" id="top" ref={heroRef} aria-label="معرفی هوکا">
          <div className="hero-sticky">
            <div className="hero-frame">
              <img src="/images/hero/hero-azure.jpg" alt="قلیان مدرن هوکا در فضای گرم رستوران فرمونتی" fetchPriority="high" />
              <div className="hero-shade" />
              <div className="hero-copy">
                <p className="eyebrow">FERMONTEE PRESENTS · TEHRAN</p>
                <h1>HOO<span>K</span>A</h1>
                <div className="hero-intro">
                  <p>آیینی آشنا،<br />با روایتی تازه.</p>
                  <span lang="en" dir="ltr">A ritual,<br />reimagined.</span>
                </div>
              </div>
              <div className="hero-scroll-note">
                <span>SCROLL TO DISCOVER</span><i aria-hidden="true" />
              </div>
              <p className="hero-count">01 / 05</p>
            </div>
          </div>
        </section>

        <section className="object-section" id="object" aria-labelledby="object-title">
          <div className="object-heading">
            <p>THE OBJECT · جسم</p>
            <h2 id="object-title">FORM BECOMES<br /><em>an experience.</em></h2>
            <p className="object-fa">هوکا فقط یک منو نیست؛ مجموعه‌ای از فرم، نور، طعم و مکث است.</p>
          </div>

          <div
            className="object-stage"
            ref={stageRef}
            onPointerMove={moveStage}
            onPointerLeave={resetStage}
          >
            <div className="stage-meta stage-meta-top"><span>OBJECT 01</span><span>DRAG / ORBIT — SOON</span></div>
            <div className="stage-orbit" aria-hidden="true"><i /><i /></div>
            <figure>
              <img src="/images/stage/classic-smoke.jpg" alt="قلیان کلاسیک هوکا در قاب نمایشی سه‌بعدی آینده" loading="lazy" />
            </figure>
            <p className="stage-caption">3D MODEL SLOT<br /><span>GLB / READY</span></p>
            <div className="stage-meta stage-meta-bottom"><span>H — 780 MM</span><span>MATERIAL STUDY</span><span>001</span></div>
          </div>
        </section>

        <section className="gallery-scroll" id="collection" ref={galleryRef} aria-label="دسته‌بندی محصولات">
          <div className="gallery-sticky">
            <div className="gallery-head">
              <p>THE COLLECTION · 2026</p>
              <h2>Four ways<br />to slow down.</h2>
              <span>برای دیدن مجموعه اسکرول کنید</span>
            </div>
            <div className="gallery-track" ref={galleryTrackRef}>
              {gallery.map((item) => (
                <a className="gallery-card" key={item.id} href="#menu" onClick={() => setActiveId(item.id)}>
                  <img src={item.image} alt={item.faName} loading="lazy" />
                  <div className="gallery-card-shade" />
                  <p>{item.tone}</p>
                  <div>
                    <h3>{item.name}</h3>
                    <span>{item.faName}</span>
                  </div>
                  <b aria-hidden="true">↙</b>
                </a>
              ))}
              <div className="gallery-end" aria-hidden="true">
                <span>THE MENU</span>
                <p>Choose<br /><i>your ritual.</i></p>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-title">
          <div className="menu-heading">
            <p>HOOKA MENU · منوی هوکا</p>
            <h2 id="menu-title">SELECT<br /><em>your experience.</em></h2>
          </div>

          <div className="menu-layout">
            <div className="product-tabs" role="tablist" aria-label="انتخاب مدل قلیان">
              {products.map((product) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active.id === product.id}
                  className={active.id === product.id ? "is-active" : ""}
                  key={product.id}
                  onClick={() => setActiveId(product.id)}
                >
                  <small>{product.index}</small>
                  <span>{product.name}<i>{product.faName}</i></span>
                  <b aria-hidden="true">↙</b>
                </button>
              ))}
            </div>

            <div className="product-copy" key={`${active.id}-copy`}>
              <p className="product-number">{active.index} / 04</p>
              <h3>{active.name}</h3>
              <p className="product-fa-name">{active.faName}</p>
              <p className="product-description">{active.description}</p>
              <div className="product-detail-row">
                <img src={active.detail} alt={`جزئیات ${active.faName}`} />
                <div>
                  <small>THE SERVE</small>
                  <p>{active.note}</p>
                </div>
              </div>
              <div className="price-row">
                <span>قیمت سرو</span>
                <strong>{active.price}</strong>
              </div>
            </div>

            <figure className="product-visual" key={`${active.id}-visual`}>
              <img src={active.full} alt={active.faName} />
              <figcaption><span>HOOKA / {active.index}</span><span>FERMONTEE</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="editorial-break" aria-label="نگاه هوکا">
          <div className="editorial-images">
            <img src="/images/editorial/spectrum.jpg" alt="جزئیات رنگی مجموعه هوکا" loading="lazy" />
            <img src="/images/editorial/lineup.jpg" alt="مجموعه مدل‌های هوکا" loading="lazy" />
            <img src="/images/editorial/onyx.jpg" alt="مدل مشکی مجموعه هوکا" loading="lazy" />
          </div>
          <p>Designed for the table.<br /><em>Remembered after the night.</em></p>
        </section>
      </main>

      <footer>
        <div className="footer-top"><span>FERMONTEE · TEHRAN</span><span>36°N / 51°E</span></div>
        <div className="footer-center">
          <p>THE NIGHT CAN WAIT.</p>
          <h2>HOO<span>K</span>A</h2>
          <p className="footer-fa">تجربه‌ات را انتخاب کن.</p>
          <a href="#menu">EXPLORE THE MENU <span aria-hidden="true">↙</span></a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 HOOKA</span>
          <a href="#top">BACK TO TOP ↑</a>
          <span>BY FERMONTEE</span>
        </div>
      </footer>
    </>
  );
}
