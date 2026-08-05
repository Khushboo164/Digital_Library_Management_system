import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaSearch, FaChartLine, FaUserShield, FaArrowRight, FaBookOpen, FaStar, FaUsers, FaUndo } from "react-icons/fa";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Fluid Background Blobs */}
      <div className="landing-blob-1"></div>
      <div className="landing-blob-2"></div>
      <div className="landing-blob-3"></div>
      <div className="landing-blob-4"></div>

      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-icon">
            <FaBook />
          </div>
          <span className="landing-nav-logo-text">
            Book<span>Sphere</span>
          </span>
        </div>

        <ul className="landing-nav-links">
          <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a></li>
          <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a></li>
          <li><a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a></li>
        </ul>

        <div className="landing-nav-actions">
          <button onClick={() => navigate("/login")} className="btn btn-ghost">
            Sign In
          </button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-text animate-fade-in-up">
          <div className="landing-hero-badge">
            <FaStar /> Smart Library Platform
          </div>

          <h1 className="landing-hero-title">
            Your Digital <span>Library</span> Experience, Reimagined
          </h1>

          <p className="landing-hero-desc">
            BookSphere is a modern library management system designed to simplify
            borrowing, tracking, and discovering books. Whether you're a reader,
            librarian, or admin — we've got your shelves covered.
          </p>

          <div className="landing-hero-btns">
            <button onClick={() => navigate("/register")} className="btn btn-cta btn-lg">
              Start Exploring <FaArrowRight />
            </button>
            <button onClick={() => navigate("/login")} className="btn btn-outline btn-lg">
              Sign In
            </button>
          </div>

          <div className="landing-hero-stats">
            <div className="landing-stat">
              <span className="landing-stat-val">2,500+</span>
              <span className="landing-stat-label">Books Available</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-val">800+</span>
              <span className="landing-stat-label">Active Members</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-val">99%</span>
              <span className="landing-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Visual — Floating Dashboard Preview */}
        <div className="landing-hero-visual">
          <svg viewBox="0 0 500 400" className="w-full h-auto max-w-lg" xmlns="http://www.w3.org/2000/svg">
            {/* Background elements */}
            <circle cx="250" cy="200" r="150" fill="#EDE7FF" opacity="0.6"/>
            <circle cx="100" cy="100" r="20" fill="#FBBF24" opacity="0.8"/>
            <circle cx="400" cy="300" r="15" fill="#34D399" opacity="0.8"/>
            <path d="M420,100 l10,-10 l10,10 l-10,10 Z" fill="#F87171" opacity="0.8"/>
            
            {/* Bookshelf */}
            <rect x="150" y="250" width="200" height="10" fill="#A78BFA" rx="5"/>
            <rect x="150" y="150" width="200" height="10" fill="#A78BFA" rx="5"/>
            
            {/* Books on shelf 1 */}
            <rect x="170" y="80" width="20" height="70" fill="#7C5CFC" rx="2"/>
            <rect x="195" y="100" width="15" height="50" fill="#34D399" rx="2"/>
            <rect x="215" y="70" width="25" height="80" fill="#FBBF24" rx="2"/>
            <polygon points="245,150 255,150 290,90 280,90" fill="#F87171"/>
            
            {/* Books on shelf 2 */}
            <rect x="180" y="180" width="22" height="70" fill="#60A5FA" rx="2"/>
            <rect x="205" y="190" width="18" height="60" fill="#F87171" rx="2"/>
            <rect x="225" y="170" width="25" height="80" fill="#7C5CFC" rx="2"/>
            <rect x="255" y="185" width="20" height="65" fill="#34D399" rx="2"/>
            <polygon points="280,250 290,250 325,190 315,190" fill="#FBBF24"/>

            {/* Laptop/Screen */}
            <rect x="200" y="290" width="100" height="60" fill="#7C5CFC" rx="5"/>
            <rect x="205" y="295" width="90" height="45" fill="#EDE7FF" rx="2"/>
            <path d="M190,350 l120,0 l-10,10 l-100,0 Z" fill="#A78BFA"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="landing-features-header">
          <h2>Why Choose BookSphere?</h2>
          <p>Everything you need to manage a modern library, in one elegant platform.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <FaSearch />
            </div>
            <h4>Smart Catalog Search</h4>
            <p>
              Find any book instantly with powerful search and filters. Browse by
              category, author, language, or year published.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-cta">
              <FaChartLine />
            </div>
            <h4>Reading Analytics</h4>
            <p>
              Track your reading progress, earn XP scores, and level up your
              reading journey with our gamified analytics dashboard.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-sky">
              <FaUserShield />
            </div>
            <h4>Role-Based Access</h4>
            <p>
              Separate dashboards for Members, Librarians, and Admins. Each role
              gets exactly the tools they need.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-about" id="about">
        <div className="about-visual">
          <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="250" cy="200" r="180" fill="#EDE7FF"/>
            <path d="M150,250 Q250,280 350,250 L350,150 Q250,180 150,150 Z" fill="#7C5CFC"/>
            <path d="M150,250 Q250,220 350,250 L350,150 Q250,120 150,150 Z" fill="#A78BFA"/>
            <rect x="245" y="130" width="10" height="130" fill="#EDE7FF"/>
          </svg>
        </div>
        <div className="about-content">
          <div className="about-badge">
            <FaStar /> About BookSphere
          </div>
          <h2 className="about-title">A Modern Digital Library for Everyone</h2>
          <p className="about-desc">
            BookSphere bridges the gap between traditional libraries and modern digital convenience. 
            We provide an intuitive platform for discovering new knowledge, tracking your reading journey, 
            and managing library resources efficiently.
          </p>
          <div className="about-features-grid">
            <div className="about-feature-item">
              <div className="about-feature-icon" style={{background: 'var(--primary-light)', color: 'var(--primary)'}}>
                <FaSearch />
              </div>
              <div>
                <h4 style={{marginBottom: '0.25rem'}}>Smart Search</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>Find books instantly.</p>
              </div>
            </div>
            <div className="about-feature-item">
              <div className="about-feature-icon" style={{background: 'var(--mint-light)', color: 'var(--mint)'}}>
                <FaBookOpen />
              </div>
              <div>
                <h4 style={{marginBottom: '0.25rem'}}>Borrow & Return</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>Seamless tracking.</p>
              </div>
            </div>
            <div className="about-feature-item">
              <div className="about-feature-icon" style={{background: 'var(--sky-light)', color: 'var(--sky)'}}>
                <FaUserShield />
              </div>
              <div>
                <h4 style={{marginBottom: '0.25rem'}}>Role-Based Access</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>For admins & readers.</p>
              </div>
            </div>
            <div className="about-feature-item">
              <div className="about-feature-icon" style={{background: 'var(--cta-light)', color: 'var(--cta)'}}>
                <FaChartLine />
              </div>
              <div>
                <h4 style={{marginBottom: '0.25rem'}}>Analytics Dashboard</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>Track your progress.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how-it-works" id="how-it-works">
        <div className="how-it-works-header">
          <h2>How It Works</h2>
          <p>Get started with BookSphere in five simple steps.</p>
        </div>
        <div className="steps-flow">
          <div className="step-card">
            <div className="step-number"><FaSearch /></div>
            <h4>Search Books</h4>
            <p>Find your next read</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number"><FaBookOpen /></div>
            <h4>Borrow</h4>
            <p>Check out easily</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number"><FaBook /></div>
            <h4>Read</h4>
            <p>Enjoy the book</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number"><FaUndo /></div>
            <h4>Return</h4>
            <p>Bring it back</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number"><FaChartLine /></div>
            <h4>Track Progress</h4>
            <p>See your stats</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats-section">
        <div className="stats-section-header">
          <h2>Why Students Love BookSphere</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{background: 'var(--primary-light)', color: 'var(--primary)'}}>
              <FaBook />
            </div>
            <div className="stat-card-value">2,500+</div>
            <div className="stat-card-label">Books Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{background: 'var(--sky-light)', color: 'var(--sky)'}}>
              <FaUsers />
            </div>
            <div className="stat-card-value">800+</div>
            <div className="stat-card-label">Active Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{background: 'var(--mint-light)', color: 'var(--mint)'}}>
              <FaBookOpen />
            </div>
            <div className="stat-card-value">10,000+</div>
            <div className="stat-card-label">Books Borrowed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{background: 'var(--cta-light)', color: 'var(--cta)'}}>
              <FaStar />
            </div>
            <div className="stat-card-value">99%</div>
            <div className="stat-card-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} BookSphere — Knowledge Beyond Shelves. Built with ❤️</p>
      </footer>
    </div>
  );
};

export default Landing;
