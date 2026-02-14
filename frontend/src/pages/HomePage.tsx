import { Link } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Instant Scoping",
      desc: "Turn a single sentence into a comprehensive project specification containing user stories, engineering tasks, and acceptance criteria.",
      // Icon: Zap / Lightning
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    },
    {
      title: "Risk Detection",
      desc: "Our engine analyzes your constraints to predict technical bottlenecks and security risks before you write a single line of code.",
      // Icon: Shield
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: "Developer Native",
      desc: "Export your entire roadmap to Markdown or plain text. Ready to paste directly into GitHub Issues, Linear, or Jira.",
      // Icon: Save / Floppy
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      )
    }
  ];

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="version-badge">v2.0 Now Available</div>
        <h1 className="hero-title">
          Stop writing tickets.<br />
          <span className="text-subtle">Start building.</span>
        </h1>
        <p className="hero-subtitle">
          Turn vague ideas into actionable engineering roadmaps in seconds. 
          Generate user stories, technical tasks, and risk assessments instantly.
        </p>
        
        <div className="hero-actions">
          <Link to="/create">
            <button className="btn btn-primary btn-lg">Start for free</button>
          </Link>
          <a href="#how-it-works">
            <button className="btn btn-secondary btn-lg">How it works</button>
          </a>
        </div>

        <div className="hero-footer">
          No credit card required · Open Source · Export to Markdown
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-value">10k+</div>
          <div className="stat-label">Tasks Generated</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">2.4s</div>
          <div className="stat-label">Avg. Gen Time</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">100%</div>
          <div className="stat-label">Markdown Ready</div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="how-it-works" className="features-section">
        <h2 className="section-title">Everything you need to plan.</h2>
        
        <div className="features-grid">
          {features.map((f, i) => (
            <div 
              key={i}
              className={`feature-card ${hoveredFeature === i ? "active" : ""}`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO VISUAL */}
      <section className="demo-section">
        <div className="demo-terminal">
          <div className="terminal-line comment">// Input</div>
          <div className="terminal-line input">
            "Build a simplified Uber clone for dog walking."
          </div>
          
          <div className="terminal-line comment">// Output</div>
          <div className="terminal-output">
            <div className="output-row">
              <span className="badge badge-green">Story</span>
              <span>As a dog owner, I want to track walks via GPS...</span>
            </div>
            <div className="output-row">
              <span className="badge badge-blue">Task</span>
              <span>Implement WebSocket geolocation service</span>
            </div>
            <div className="output-row">
              <span className="badge badge-red">Risk</span>
              <span>Battery drain from continuous GPS usage</span>
            </div>
          </div>
        </div>
        <p className="demo-caption">From text to technical breakdown in &lt; 5 seconds.</p>
      </section>

      {/* FOOTER CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to ship?</h2>
        <Link to="/create">
          <button className="btn btn-primary btn-lg">Generate your first spec</button>
        </Link>
      </section>
    </div>
  );
}