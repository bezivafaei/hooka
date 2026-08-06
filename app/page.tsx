"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Product = {
  id: string;
  index: string;
  name: string;
  price: string;
  full: string;
  detail: string;
  description: string;
  note: string;
  detailText: string;
};

const products: Product[] = [
  {
    id: "tulips",
    index: "۰۱",
    name: "تیولیپس",
    price: "۱٬۹۵۰٬۰۰۰ تومان",
    full: "/images/products/tulips/full.jpg",
    detail: "/images/products/tulips/detail.jpg",
    description: "فرمی مجسمه‌وار با بازتاب طلایی؛ حضوری که پیش از اولین کام، حال‌وهوای میز را تعریف می‌کند.",
    note: "سرو ویژه هوکا · انتخاب طعم با مهمان",
    detailText: "نمای نزدیک از تاج طلایی و پرداخت صیقلی بدنه",
  },
  {
    id: "wookah",
    index: "۰۲",
    name: "ووکا",
    price: "۱٬۴۰۰٬۰۰۰ تومان",
    full: "/images/products/wookah/full.jpg",
    detail: "/images/products/wookah/detail.jpg",
    description: "سیلوئتی کشیده با جزئیات دست‌ساز؛ برداشتی مدرن از یک آیین آشنا برای شب‌های طولانی.",
    note: "سرو اختصاصی فرمونتی · طعم ترکیبی",
    detailText: "جزئیات نقش بدنه، اتصالات فلزی و امضای ووکا",
  },
  {
    id: "arabic",
    index: "۰۳",
    name: "عربی",
    price: "۱٬۰۵۰٬۰۰۰ تومان",
    full: "/images/products/arabic/full.jpg",
    detail: "/images/products/arabic/detail.jpg",
    description: "بدنه کلاسیک، فلز گرم و شیشه شفاف؛ اصالت سرو عربی در قاب امروزی هوکا.",
    note: "سرو کلاسیک · طعم‌های سنتی منتخب",
    detailText: "پرداخت فلزی گرم و جزئیات آماده‌سازی سرو کلاسیک",
  },
  {
    id: "economy",
    index: "۰۴",
    name: "اکونومی",
    price: "۸۵۰٬۰۰۰ تومان",
    full: "/images/products/economy/full.jpg",
    detail: "/images/products/economy/detail.jpg",
    description: "مینیمال، شفاف و بی‌تکلف؛ تجربه کامل هوکا با تمرکز روی طعم و ریتم میز.",
    note: "سرو روزانه · انتخاب طعم با مهمان",
    detailText: "نمای نزدیک از فرایند آماده‌سازی و کیفیت سرو",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function TypeLine({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`type-line ${className}`} style={{ "--line-delay": `${delay}ms` } as CSSProperties}>
      <span>{children}</span>
    </span>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState("tulips");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [headerOnDark, setHeaderOnDark] = useState(false);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const objectRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const active = products.find((product) => product.id === activeId) ?? products[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const galleryElement = galleryRef.current;
    const trackElement = trackRef.current;
    const motion = {
      targetHero: 0,
      currentHero: 0,
      targetObject: 0,
      currentObject: 0,
      targetGallery: 0,
      currentGallery: 0,
      galleryTravel: 0,
    };
    let frame = 0;
    let previousTime = performance.now();
    let previousPastHero = false;
    let previousHeaderOnDark = false;
    let disposed = false;
    const darkHeaderSections = Array.from(document.querySelectorAll<HTMLElement>(".gallery-scroll, footer"));

    const syncGalleryGeometry = () => {
      const gallery = galleryElement;
      const track = trackElement;
      if (!gallery || !track) return;

      if (window.innerWidth < 760) {
        gallery.style.removeProperty("height");
        motion.galleryTravel = 0;
        return;
      }

      motion.galleryTravel = Math.max(track.scrollWidth - window.innerWidth, 0);
      gallery.style.height = `${Math.ceil(window.innerHeight + motion.galleryTravel)}px`;
    };

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

      if (objectRef.current) {
        const rect = objectRef.current.getBoundingClientRect();
        motion.targetObject = clamp((viewport - rect.top) / (viewport + rect.height));
      }

      if (galleryRef.current && trackRef.current && window.innerWidth >= 760) {
        const rect = galleryRef.current.getBoundingClientRect();
        const distance = Math.max(galleryRef.current.offsetHeight - viewport, 1);
        motion.targetGallery = clamp(-rect.top / distance);
      } else {
        motion.targetGallery = 0;
        motion.currentGallery = 0;
        trackRef.current?.style.setProperty("transform", "none");
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
      const galleryEase = 1 - Math.exp(-delta / 220);
      motion.currentHero += (motion.targetHero - motion.currentHero) * sceneEase;
      motion.currentObject += (motion.targetObject - motion.currentObject) * sceneEase;
      motion.currentGallery += (motion.targetGallery - motion.currentGallery) * galleryEase;

      document.documentElement.style.setProperty("--hero-p", motion.currentHero.toFixed(4));
      document.documentElement.style.setProperty("--object-p", motion.currentObject.toFixed(4));
      document.documentElement.style.setProperty("--gallery-p", motion.currentGallery.toFixed(4));
      if (trackRef.current && window.innerWidth >= 760) {
        trackRef.current.style.transform = `translate3d(${-motion.currentGallery * motion.galleryTravel}px, 0, 0)`;
      }

      const moving =
        Math.abs(motion.targetHero - motion.currentHero) > 0.0005 ||
        Math.abs(motion.targetObject - motion.currentObject) > 0.0005 ||
        Math.abs(motion.targetGallery - motion.currentGallery) > 0.0005;

      frame = moving ? window.requestAnimationFrame(render) : 0;
    };

    const requestUpdate = () => {
      measure();
      if (!frame) {
        previousTime = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      syncGalleryGeometry();
      requestUpdate();
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal], [data-type]").forEach((element) => observer.observe(element));

    const resizeObserver = new ResizeObserver(() => {
      syncGalleryGeometry();
      requestUpdate();
    });
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    syncGalleryGeometry();
    document.fonts.ready.then(() => {
      if (disposed) return;
      syncGalleryGeometry();
      requestUpdate();
    });
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      galleryElement?.style.removeProperty("height");
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const locked = menuOpen || detailOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDetailOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, detailOpen]);

  return (
    <>
      <div className={`loader ${ready ? "is-ready" : ""}`} aria-hidden="true">
        <p>هوکا</p><div><i /></div><span>فرمونتی · تهران</span>
      </div>

      <header className={`topbar ${pastHero ? "is-light" : ""} ${headerOnDark ? "is-dark" : ""}`} aria-label="ناوبری اصلی">
        <button className="nav-box nav-menu" type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="site-menu">
          <span>فهرست</span><i aria-hidden="true" /><i aria-hidden="true" />
        </button>
        <a className="wordmark" href="#top" aria-label="هوکا، بازگشت به ابتدا">هوکا</a>
        <a className="nav-box nav-cta" href="#menu">مشاهده منو</a>
      </header>

      <aside id="site-menu" className={`menu-overlay ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <button type="button" className="menu-close" onClick={() => setMenuOpen(false)}>بستن <span>×</span></button>
        <nav aria-label="فهرست صفحه">
          {[
            ["۰۱", "معرفی", "#top"],
            ["۰۲", "محصول شاخص", "#object"],
            ["۰۳", "مجموعه", "#collection"],
            ["۰۴", "منوی هوکا", "#menu"],
          ].map(([number, label, href]) => (
            <a href={href} key={label} onClick={() => setMenuOpen(false)}>
              <small>{number}</small><span>{label}</span><b>↙</b>
            </a>
          ))}
        </nav>
        <div className="overlay-meta"><p>فرمونتی · تهران</p><p>منوی دیجیتال هوکا</p></div>
      </aside>

      <main>
        <section className="hero-scroll" id="top" ref={heroRef} aria-labelledby="hero-title">
          <div className="hero-sticky">
            <div className="hero-frame">
              <img src="/images/hero/hero-azure.jpg" alt="قلیان مدرن هوکا در فضای شبانه فرمونتی" fetchPriority="high" />
              <div className="hero-vignette" />
              <div className={`hero-title ${ready ? "is-visible" : ""}`} id="hero-title" data-type>
                <p>فرمونتی ارائه می‌کند</p>
                <h1><TypeLine>آیین شب،</TypeLine><TypeLine delay={120} className="light">از نو.</TypeLine></h1>
                <span>هوکا</span>
              </div>
              <p className="hero-side-note">تجربه‌ای آرام<br />برای شب‌هایی آهسته‌تر</p>
              <div className="hero-bottom"><span>برای کشف بیشتر اسکرول کنید</span><i /><b>۰۱ / ۰۵</b></div>
              <div className="hero-shrink-meta" aria-hidden="true"><span>هوکا / فرمونتی</span><span>تهران · ۱۴۰۵</span></div>
            </div>
          </div>
        </section>

        <section className="object-intro" id="object" ref={objectRef} aria-labelledby="object-title">
          <div className="section-kicker" data-reveal><span>محصول شاخص</span><i /><span>جسم</span></div>
          <div className="object-title" data-type>
            <h2 id="object-title"><TypeLine>فرم، به تجربه</TypeLine><TypeLine delay={110} className="light">تبدیل می‌شود.</TypeLine></h2>
            <p data-reveal>در قلب شب، فرم و طعم به یک تجربه تبدیل می‌شوند؛ آرام، دقیق و به‌یادماندنی.</p>
          </div>

          <div className="object-composition">
            <p className="object-ghost" aria-hidden="true">هوکا</p>
            <div className="object-copy" data-reveal>
              <span>مرحله بعد</span>
              <p>این قاب در مرحله بعد میزبان مدل سه‌بعدی واقعی محصول خواهد بود و حرکت آن با ریتم اسکرول هماهنگ می‌شود.</p>
            </div>
            <figure className="object-figure"><img src="/images/products/tulips/full.jpg" alt="قلیان تیولیپس به‌عنوان محصول شاخص هوکا" loading="lazy" /></figure>
            <div className="object-index"><span>محصول</span><b>۰۱</b><small>مجموعه هوکا</small></div>
          </div>
        </section>

        <section className="manifesto" aria-label="مانیفست هوکا">
          <p className="section-kicker" data-reveal>جوهره هوکا</p>
          <h2 data-type><TypeLine>جایی که فرم،</TypeLine><TypeLine delay={110} className="light">به آیین می‌رسد.</TypeLine></h2>
          <div className="manifesto-stage">
            <div className="manifesto-note" data-reveal>
              <span>فصل دوم / تجربه</span>
              <p>هر انتخاب، روایتی متفاوت از یک مکث مشترک است؛ با جزئیاتی که برای دیده‌شدن از نزدیک طراحی شده‌اند.</p>
            </div>
            <figure data-reveal><img src="/images/editorial/spectrum.jpg" alt="جزئیات فرم و رنگ هوکا" loading="lazy" /></figure>
            <div className="manifesto-index" data-reveal><b>۰۴</b><span>فرم متفاوت<br />برای چهار حال‌وهوا</span></div>
          </div>
        </section>

        <section className="gallery-scroll" id="collection" ref={galleryRef} aria-label="مجموعه محصولات هوکا">
          <div className="gallery-sticky">
            <div className="gallery-header">
              <div className="section-kicker"><span>مجموعه هوکا</span><i /><span>چهار محصول</span></div>
              <div className="gallery-progress" aria-hidden="true"><span>حرکت در مجموعه</span><i><b /></i><em>۰۱ — ۰۴</em></div>
            </div>
            <div className="gallery-track" ref={trackRef}>
              <div className="gallery-opening">
                <small>مجموعه سال ۱۴۰۵</small>
                <h2 data-type><TypeLine>چهار روایت،</TypeLine><TypeLine delay={100} className="light">برای یک مکث.</TypeLine></h2>
              </div>
              {products.map((product) => (
                <a className="gallery-card" href="#menu" key={product.id} onClick={() => setActiveId(product.id)}>
                  <img src={product.full} alt={`قلیان ${product.name}`} loading="lazy" />
                  <div className="gallery-shade" />
                  <div className="card-top"><span>{product.index} / ۰۴</span><span>قلیان {product.name}</span></div>
                  <div className="card-title"><h3>{product.name}</h3><span>مشاهده سرو ↙</span></div>
                </a>
              ))}
              <div className="gallery-closing">
                <p>منوی هوکا</p><h2>آیین خودت<br /><span className="light">را انتخاب کن.</span></h2><span>چهار سرو · یک شب</span>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-title">
          <div className="section-kicker" data-reveal><span>منوی هوکا</span><i /><span>فرمونتی</span></div>
          <div className="menu-title" data-type>
            <h2 id="menu-title"><TypeLine>تجربه‌ات را</TypeLine><TypeLine delay={110} className="light">انتخاب کن.</TypeLine></h2>
            <p data-reveal>چهار انتخاب؛ از فرم مجسمه‌وار تا سرو کلاسیک.</p>
          </div>

          <div className="product-selector" role="tablist" aria-label="انتخاب مدل قلیان" data-reveal>
            {products.map((product) => (
              <button type="button" role="tab" aria-selected={active.id === product.id} className={active.id === product.id ? "is-active" : ""} key={product.id} onClick={() => setActiveId(product.id)}>
                <small>{product.index}</small><span>{product.name}</span><i>قلیان {product.name}</i>
              </button>
            ))}
          </div>

          <div className="menu-product">
            <article className="product-info" key={`${active.id}-info`}>
              <div className="product-heading"><span>{active.index} / ۰۴</span><h3>{active.name}</h3><p>قلیان {active.name}</p></div>
              <p className="product-description">{active.description}</p>
              <button className="serve-detail" type="button" onClick={() => setDetailOpen(true)} aria-label={`نمایش جزئیات قلیان ${active.name}`}>
                <span className="detail-image"><img src={active.detail} alt={`جزئیات قلیان ${active.name}`} /><i>نمای نزدیک</i></span>
                <span className="detail-copy"><small>جزئیات سرو</small><strong>{active.note}</strong><b>نمایش جزئیات ↙</b></span>
              </button>
              <div className="product-price"><span>قیمت سرو</span><strong>{active.price}</strong></div>
            </article>
            <figure className="product-image" key={`${active.id}-image`}>
              <img src={active.full} alt={`قلیان ${active.name}`} />
              <figcaption><span>هوکا / {active.index}</span><span>فرمونتی · تهران</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="closing-story" aria-label="گالری هوکا">
          <div className="closing-grid" data-reveal>
            <figure><img src="/images/editorial/lineup.jpg" alt="مجموعه مدل‌های هوکا" loading="lazy" /></figure>
            <figure><img src="/images/editorial/onyx.jpg" alt="مدل مشکی هوکا" loading="lazy" /></figure>
            <figure><img src="/images/editorial/spectrum.jpg" alt="مدل رنگی هوکا" loading="lazy" /></figure>
          </div>
          <blockquote data-type><TypeLine>برای میز طراحی شده؛</TypeLine><TypeLine delay={110} className="light">پس از شب، به یاد می‌ماند.</TypeLine></blockquote>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-meta"><span>هوکا در فرمونتی</span><span>تهران · شهرک غرب</span></div>

        <div className="footer-statement" data-type>
          <p>پایان منو، آغاز یک شب آرام</p>
          <h2><TypeLine>برای یک مکث،</TypeLine><TypeLine delay={110} className="light">وقت هست.</TypeLine></h2>
        </div>

        <div className="footer-contact-grid" data-reveal>
          <section>
            <small>نشانی</small>
            <a href="https://www.google.com/maps/search/?api=1&query=Fermontee+Restaurant+Tehran" target="_blank" rel="noreferrer">تهران، شهرک غرب، خیابان ایران‌زمین، خیابان مهستان، نبش کوچه دوم <b>↗</b></a>
          </section>
          <section>
            <small>رزرو و تماس</small>
            <a className="footer-phone" href="tel:+989912221025" dir="ltr">۰۹۹۱ ۲۲۲ ۱۰۲۵</a>
            <span>هر روز، از ۸:۰۰ تا ۲۴:۰۰</span>
          </section>
          <section>
            <small>ارتباط</small>
            <a href="https://www.instagram.com/fermontee.restaurant/" target="_blank" rel="noreferrer">اینستاگرام <b>↗</b></a>
            <a href="https://wa.me/message/44UP6TCPTX6CB1" target="_blank" rel="noreferrer">واتساپ <b>↗</b></a>
          </section>
        </div>

        <div className="footer-word" aria-hidden="true">هوکا</div>
        <div className="footer-bottom"><span>© ۱۴۰۵ هوکا · فرمونتی</span><a href="#top">بازگشت به بالا ↑</a><span>از صبحانه تا شام، میزبان شما</span></div>
      </footer>

      <div className={`detail-overlay ${detailOpen ? "is-open" : ""}`} aria-hidden={!detailOpen} role="dialog" aria-modal="true" aria-label={`جزئیات قلیان ${active.name}`}>
        <button type="button" className="detail-close" onClick={() => setDetailOpen(false)}>بستن <span>×</span></button>
        <div className="detail-stage">
          <figure key={`${active.id}-detail`}><img src={active.detail} alt={active.detailText} /></figure>
          <div className="detail-meta"><span>{active.index} / ۰۴</span><h2>{active.name}</h2><p>{active.detailText}</p><small>{active.note}</small></div>
        </div>
      </div>
    </>
  );
}
