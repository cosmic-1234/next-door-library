import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import api from '../api/axios';
import BookCard from '../components/BookCard';

// Animated counter hook
function useCounter(target, inView) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v))
    });
    return controls.stop;
  }, [inView, target]);
  return value;
}

function StatCounter({ value, label, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, inView);
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

const LITERARY_QUOTES = [
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "People said Ove saw the world in black and white. But she was color. All the color he had.", author: "Fredrik Backman, A Man Called Ove" },
  { text: "Don't ignore half of me so you can fit me into a box. Don't do that.", author: "Taylor Jenkins Reid, The Seven Husbands of Evelyn Hugo" },
  { text: "We read to know we are not alone.", author: "C.S. Lewis" },
];

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const howInView = useInView(howItWorksRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    api.get('/books/featured').then(res => setFeaturedBooks(res.data.books || [])).catch(() => {});
    const interval = setInterval(() => setQuoteIndex(i => (i + 1) % LITERARY_QUOTES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = LITERARY_QUOTES[quoteIndex];

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <motion.div className="hero-bg" style={{ y: heroY }}>
          <div className="hero-bg-orb hero-bg-orb-1" />
          <div className="hero-bg-orb hero-bg-orb-2" />
          <div className="hero-bg-orb hero-bg-orb-3" />
          <div className="hero-paper-texture" />
        </motion.div>

        <motion.div className="hero-content container" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero-eyebrow">Nagpur's Community Library</span>
            <h1 className="hero-title">
              Stories find<br />
              <em>their next reader</em>
            </h1>
            <p className="hero-subtitle">
              Borrow beautifully curated books for just <strong>₹15–30 per week</strong>.
              Read slow, live deep. Become part of a community that believes in
              the magic of turning pages.
            </p>

            <div className="hero-cta">
              <Link to="/books" className="btn btn-primary btn-lg" id="hero-browse-btn">
                Browse the Collection
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg" id="hero-join-btn">
                Join the Library
              </Link>
            </div>

            <div className="hero-trust">
              <div className="hero-trust-item">
                <span className="hero-trust-icon">📚</span>
                <span>100+ curated books</span>
              </div>
              <div className="hero-trust-dot" />
              <div className="hero-trust-item">
                <span className="hero-trust-icon">🏠</span>
                <span>Home delivery in Nagpur</span>
              </div>
              <div className="hero-trust-dot" />
              <div className="hero-trust-item">
                <span className="hero-trust-icon">♻️</span>
                <span>Sustainable reading</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-book-stack">
              {['#C4906A', '#8A9A7B', '#3B2314', '#D4A882', '#7A8F6E'].map((color, i) => (
                <motion.div
                  key={i}
                  className="hero-book-spine"
                  style={{ background: color, height: `${140 - i * 8}px`, zIndex: 5 - i }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            <div className="hero-card-quote">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <p className="hero-quote-text">"{currentQuote.text}"</p>
                <p className="hero-quote-author">— {currentQuote.author}</p>
              </motion.div>
            </div>

            <div className="hero-logo-mark">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="58" stroke="var(--brown-rich)" strokeWidth="1.5" opacity="0.3"/>
                <path d="M60 90C44 78 30 65 30 50C30 41.7 36.7 35 45 35C50.5 35 55.5 37.8 60 42C64.5 37.8 69.5 35 75 35C83.3 35 90 41.7 90 50C90 65 76 78 60 90Z"
                  stroke="var(--brown-rich)" strokeWidth="2" fill="var(--copper)" fillOpacity="0.15"/>
                <line x1="60" y1="42" x2="60" y2="90" stroke="var(--brown-mid)" strokeWidth="1.5"/>
                <path d="M45 52C45 52 50 48 55 52M65 52C65 52 70 48 75 52" stroke="var(--brown-mid)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
          </motion.div>
        </motion.div>

        <div className="hero-scroll-indicator">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="hero-scroll-line" />
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <StatCounter value={150} label="Books in Collection" suffix="+" />
            <StatCounter value={200} label="Happy Readers" suffix="+" />
            <StatCounter value={500} label="Books Lent" suffix="+" />
            <StatCounter value={30} label="Max ₹ Per Week" suffix="" />
          </div>
        </div>
      </section>

      {/* ===== FEATURED BOOKS ===== */}
      {featuredBooks.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Currently Available</span>
              <h2 className="section-title">Featured Books</h2>
              <p className="section-subtitle">
                Hand-picked titles waiting for their next reader. Each one a world unto itself.
              </p>
            </div>

            <div className="featured-grid">
              {featuredBooks.slice(0, 4).map((book, i) => (
                <BookCard key={book._id} book={book} delay={i * 0.1} />
              ))}
            </div>

            <div className="featured-cta">
              <Link to="/books" className="btn btn-secondary btn-lg" id="view-all-books-btn">
                View All Books →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== QUOTE SECTION ===== */}
      <section className="quote-section">
        <div className="container">
          <motion.div
            className="quote-block"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="quote-mark">"</div>
            <blockquote className="quote-text">
              Reading is an activity that slows you down when all of us are in such a hurry.
              When you develop this habit early, it helps you be a better human —
              more empathetic, more emotionally aware.
            </blockquote>
            <div className="quote-source">— The Philosophy of Next Door Library</div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-section" ref={howItWorksRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Simple as turning a page</span>
            <h2 className="section-title">How It Works</h2>
          </div>

          <div className="how-grid">
            {[
              { step: '01', icon: '🔍', title: 'Browse & Discover', desc: 'Explore our curated catalogue. Filter by genre, price, or availability. Find your next obsession.' },
              { step: '02', icon: '📬', title: 'Request to Rent', desc: 'Select your book and duration (1–8 weeks). Choose home delivery or pickup in Nagpur. We\'ll confirm within 24 hours.' },
              { step: '03', icon: '📖', title: 'Read & Savour', desc: 'Lose yourself in the pages. Read at your own pace. Mark it read on your profile and leave a review.' },
              { step: '04', icon: '🔄', title: 'Return & Repeat', desc: 'Return the book, update your reading history, and pick your next adventure. Your shelf, unlimited.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="how-card"
                initial={{ opacity: 0, y: 40 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="how-step-num">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h3 className="how-title">{item.title}</h3>
                <p className="how-desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY NDL ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-left">
              <span className="section-eyebrow">Why Next Door Library</span>
              <h2 className="section-title" style={{ textAlign: 'left', fontSize: 'var(--text-4xl)' }}>
                More than a library.<br />
                <em>A reading culture.</em>
              </h2>
              <p className="section-subtitle" style={{ textAlign: 'left', margin: 0, marginTop: '16px' }}>
                We believe every book deserves more than one reader. Every story deserves to travel further.
              </p>

              <Link to="/register" className="btn btn-primary" id="why-join-btn" style={{ marginTop: '32px' }}>
                Join the Community
              </Link>
            </div>

            <div className="why-right">
              {[
                { icon: '🎓', title: 'For Students & Kids', desc: 'School libraries don\'t always have the books kids want. We do — at prices that don\'t strain budgets.' },
                { icon: '👩‍👧', title: 'For Home Readers', desc: 'Love reading but feel guilty spending on books? Enjoy without the guilt. Read more, spend less.' },
                { icon: '🤔', title: 'Try Before You Commit', desc: 'Unsure if a book is for you? Rent it cheaply. If you love it, buy it. If not — no big loss.' },
                { icon: '🌱', title: 'Sustainable Reading', desc: 'One book, many readers. Less printing, less waste. Reading circles are the original green habit.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="why-item"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="why-item-icon">{item.icon}</div>
                  <div>
                    <h4 className="why-item-title">{item.title}</h4>
                    <p className="why-item-desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY CTA ===== */}
      <section className="community-cta-section">
        <div className="container">
          <motion.div
            className="community-cta-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="community-cta-content">
              <span className="section-eyebrow" style={{ color: 'var(--copper-light)' }}>Join Us</span>
              <h2 className="community-cta-title">
                Your next favourite book<br />is waiting for you
              </h2>
              <p className="community-cta-sub">
                Become part of Nagpur's growing community of readers.
                Discuss books, see what friends are reading, and discover stories together.
              </p>
              <div className="community-cta-actions">
                <Link to="/books" className="btn btn-copper btn-lg" id="cta-browse-btn">Browse Collection</Link>
                <Link to="/forum" className="btn btn-ghost btn-lg" id="cta-forum-btn" style={{ color: 'var(--cream)' }}>Join Discussions</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .home { overflow-x: hidden; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 100px;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }

        .hero-bg-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(196, 144, 106, 0.2) 0%, transparent 70%);
          top: -100px;
          right: -100px;
        }

        .hero-bg-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(122, 143, 110, 0.15) 0%, transparent 70%);
          bottom: 100px;
          left: 50px;
        }

        .hero-bg-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(201, 168, 76, 0.1) 0%, transparent 70%);
          top: 30%;
          left: 30%;
        }

        .hero-paper-texture {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 28px,
              rgba(196, 144, 106, 0.04) 28px,
              rgba(196, 144, 106, 0.04) 29px
            );
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          width: 100%;
          padding-top: 40px;
          padding-bottom: 60px;
        }

        .hero-eyebrow {
          display: inline-block;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 16px;
          padding: 6px 14px;
          background: rgba(196, 144, 106, 0.1);
          border-radius: var(--radius-full);
          border: 1px solid rgba(196, 144, 106, 0.2);
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 600;
          color: var(--brown-deep);
          line-height: 1.08;
          margin-bottom: 24px;
        }

        .hero-title em {
          font-style: italic;
          color: var(--copper);
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 36px;
          max-width: 480px;
        }

        .hero-subtitle strong { color: var(--brown-rich); font-weight: 600; }

        .hero-cta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .hero-trust-icon { font-size: 14px; }

        .hero-trust-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--copper-light);
        }

        /* Hero visual */
        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 450px;
        }

        .hero-book-stack {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
        }

        .hero-book-spine {
          width: 28px;
          border-radius: 4px 2px 2px 4px;
          box-shadow: 2px 0 8px rgba(0,0,0,0.15);
        }

        .hero-card-quote {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 144, 106, 0.2);
          border-radius: var(--radius-xl);
          padding: 32px 36px;
          max-width: 380px;
          box-shadow: var(--shadow-xl);
          position: relative;
          z-index: 2;
        }

        .hero-quote-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: var(--text-xl);
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 14px;
        }

        .hero-quote-author {
          font-size: var(--text-xs);
          color: var(--copper);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-logo-mark {
          position: absolute;
          bottom: -10px;
          right: 0;
          width: 100px;
          opacity: 0.4;
          animation: float 5s ease-in-out infinite;
        }

        .hero-scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        .hero-scroll-line {
          width: 1.5px;
          height: 40px;
          background: linear-gradient(to bottom, var(--copper), transparent);
          margin: 0 auto;
        }

        /* STATS */
        .stats-section {
          background: var(--brown-rich);
          padding: 64px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .stat-number {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 700;
          color: var(--cream);
          line-height: 1;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.6);
          font-weight: 400;
          letter-spacing: 0.03em;
        }

        /* FEATURED */
        .featured-section { background: var(--cream-light); }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .featured-cta { text-align: center; }

        /* QUOTE */
        .quote-section {
          background: var(--brown-deep);
          padding: 100px 0;
        }

        .quote-block {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
        }

        .quote-mark {
          font-family: var(--font-serif);
          font-size: 120px;
          color: var(--copper);
          opacity: 0.2;
          line-height: 0.5;
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          user-select: none;
        }

        .quote-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          color: var(--cream);
          line-height: 1.7;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .quote-source {
          font-size: var(--text-sm);
          color: var(--copper-light);
          letter-spacing: 0.1em;
          font-weight: 500;
        }

        /* HOW IT WORKS */
        .how-section { background: var(--cream); }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .how-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          border: 1px solid rgba(196, 144, 106, 0.12);
          position: relative;
          transition: all 0.3s ease;
        }

        .how-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(196, 144, 106, 0.25);
        }

        .how-step-num {
          font-family: var(--font-serif);
          font-size: var(--text-4xl);
          font-weight: 700;
          color: rgba(196, 144, 106, 0.15);
          position: absolute;
          top: 16px;
          right: 20px;
          line-height: 1;
        }

        .how-icon {
          font-size: 36px;
          margin-bottom: 16px;
        }

        .how-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .how-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* WHY */
        .why-section { background: var(--cream-dark); }

        .why-inner {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 80px;
          align-items: center;
        }

        .why-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .why-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(196, 144, 106, 0.1);
          transition: all 0.3s ease;
        }

        .why-item:hover {
          border-color: rgba(196, 144, 106, 0.25);
          box-shadow: var(--shadow-md);
        }

        .why-item-icon {
          font-size: 28px;
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .why-item-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .why-item-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* COMMUNITY CTA */
        .community-cta-section {
          background: var(--cream);
          padding: 80px 0;
        }

        .community-cta-card {
          background: var(--brown-deep);
          border-radius: var(--radius-xl);
          padding: 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .community-cta-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(196, 144, 106, 0.15) 0%, transparent 70%);
        }

        .community-cta-content { position: relative; z-index: 1; }

        .community-cta-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 600;
          color: var(--cream);
          line-height: 1.2;
          margin: 16px 0;
        }

        .community-cta-sub {
          font-size: var(--text-lg);
          color: rgba(247, 240, 227, 0.65);
          max-width: 540px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }

        .community-cta-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .hero-content { grid-template-columns: 1fr; gap: 48px; }
          .hero-visual { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .featured-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: repeat(2, 1fr); }
          .why-inner { grid-template-columns: 1fr; gap: 48px; }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.5rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .featured-grid { grid-template-columns: 1fr; }
          .how-grid { grid-template-columns: 1fr; }
          .community-cta-card { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}
