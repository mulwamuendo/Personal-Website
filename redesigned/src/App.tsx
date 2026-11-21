import { useEffect, useState } from 'react'

const projects = [
  { n: '01', kind: 'Interactive prototype', title: 'Enquiry Assistant', text: 'A browser-based response system that matches customer questions to useful answers and knows when to hand over to a person.', tools: ['JavaScript', 'NLP logic', 'UX'], href: '/demos.html#demo-reply', tone: 'ink' },
  { n: '02', kind: 'Workflow experiment', title: 'Smart Booking Flow', text: 'A practical scheduling concept for selecting appointments, avoiding double bookings and preparing automated reminders.', tools: ['JavaScript', 'Scheduling', 'Forms'], href: '/demos.html#demo-booking', tone: 'paper' },
  { n: '03', kind: 'Data utility', title: 'Weekly Sales Reader', text: 'A lightweight reporting tool that turns raw sales rows into totals, comparisons, charts and a plain-language summary.', tools: ['Data parsing', 'SVG', 'Analytics'], href: '/demos.html#demo-report', tone: 'red' },
]

const interests = [
  { n: '01', kicker: 'Football / Liverpool FC', title: 'The beautiful game, in red.', text: 'Football is ritual, tension and belonging. Liverpool is the team: the noise, the history and the idea that the game is never over until it is over.', image: '/images/football-editorial.webp', alt: 'A supporter overlooking a football stadium under floodlights', note: 'YNWA' },
  { n: '02', kicker: 'Formula 1 / Scuderia Ferrari', title: 'Precision at full speed.', text: 'Formula 1 is where engineering becomes theatre. Ferrari brings the emotion: a study in precision, pressure and the relentless pursuit of a faster lap.', image: '/images/motorsport-editorial.webp', alt: 'A red open-wheel racing car moving through a pit lane', note: 'Forza Ferrari' },
  { n: '03', kicker: 'Travel / The next horizon', title: 'Curiosity needs distance.', text: 'New places reset perspective. I travel to notice how people live, how cities work and how much there is still to understand beyond the familiar.', image: '/images/travel-editorial.webp', alt: 'A lone traveler crossing a warm mountain landscape at sunrise', note: 'Keep exploring' },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{diagonal ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}</svg>
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.12 })
    items.forEach((item) => observer.observe(item))
    const bar = document.querySelector<HTMLElement>('.progress')
    const scroll = () => {
      if (!bar) return
      const max = document.documentElement.scrollHeight - innerHeight
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`
    }
    scroll()
    addEventListener('scroll', scroll, { passive: true })
    return () => {
      observer.disconnect()
      removeEventListener('scroll', scroll)
    }
  }, [])

  return (
    <div className="site">
      <header className="header">
        <a className="wordmark" href="#top" aria-label="Mulwa Muendo, home"><span>Mulwa</span><span>Muendo</span></a>
        <button className="menu" type="button" aria-expanded={menuOpen} aria-controls="nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<i /></button>
        <nav id="nav" className={menuOpen ? 'nav open' : 'nav'} aria-label="Primary">
          {[['Home', '#top'], ['About', '#about'], ['Projects', '#projects'], ['Interests', '#interests'], ['Contact', '#contact']].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="progress" aria-hidden="true" />
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-meta"><p className="label">Computer Science student</p><p className="label">Nairobi, Kenya · EAT</p></div>
          <h1><span>Building things.</span><span className="serif">Chasing better</span><span>questions.</span></h1>
          <div className="hero-bottom">
            <p>I’m Mulwa, an aspiring software developer interested in thoughtful systems, practical technology and the ideas that move us forward.</p>
            <a className="round" href="#projects"><span>Explore work</span><Arrow /></a>
          </div>
          <div className="orbit" aria-hidden="true"><span>Code</span><span>Curiosity</span><span>Kenya</span></div>
          <p className="issue">Vol. 01 · 2025</p>
        </section>

        <section className="manifesto">
          <div className="marquee" aria-hidden="true"><div>SOFTWARE · CULTURE · CURIOSITY · SOFTWARE · CULTURE · CURIOSITY · SOFTWARE · CULTURE · CURIOSITY ·</div></div>
          <div className="manifesto-inner" data-reveal>
            <p className="index">01 / Perspective</p>
            <p className="manifesto-copy">I’m learning to build software that is not only functional, but <em>considered</em> — clear in purpose, useful in practice and made with care.</p>
          </div>
        </section>

        <section className="about wrap" id="about">
          <div className="heading" data-reveal><p className="index">02 / About</p><h2>Still learning.<br /><span className="serif">Always making.</span></h2></div>
          <div className="about-grid">
            <div className="portrait" data-reveal><div>M<span>M</span></div><p>Portrait pending · the work continues</p></div>
            <div className="about-copy" data-reveal>
              <p className="lead">I’m a Computer Science student drawn to software development, problem-solving and the process of turning an idea into something real.</p>
              <p>My interests sit where technology meets everyday life: useful web experiences, automation, data and tools that remove friction. I care about understanding the fundamentals, asking better questions and making each iteration more intentional than the last.</p>
              <p>This portfolio is a living record — part workspace, part journal and always a work in progress.</p>
              <ul className="tools">{['Python', 'JavaScript', 'HTML & CSS', 'APIs', 'SQLite', 'AI tools'].map((tool, i) => <li key={tool}><span>0{i + 1}</span>{tool}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="projects wrap" id="projects">
          <div className="heading split" data-reveal>
            <div><p className="index">03 / Selected work</p><h2>Experiments,<br /><span className="serif">in progress.</span></h2></div>
            <p>Early prototypes and practical studies. This collection will grow as the work does.</p>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article className={`project ${project.tone}`} key={project.title} data-reveal>
                <div className="project-visual"><span className="project-number">{project.n}</span><div className="shape"><i /><i /><i /></div><p>{project.kind}</p></div>
                <div className="project-copy">
                  <p className="label">{project.kind}</p><h3>{project.title}</h3><p>{project.text}</p>
                  <ul>{project.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                  <a href={project.href}>Open live demo <Arrow diagonal /></a>
                </div>
              </article>
            ))}
          </div>
          <a className="archive" href="/demos.html">Browse the full interactive demo archive <Arrow /></a>
        </section>

        <section className="interests" id="interests">
          <div className="wrap interests-intro" data-reveal><p className="index">04 / Beyond the screen</p><h2>The things that<br /><span className="serif">keep me moving.</span></h2></div>
          {interests.map((interest) => (
            <article className="interest" key={interest.title} data-reveal>
              <div className="interest-image"><img src={interest.image} alt={interest.alt} /><span>{interest.n}</span></div>
              <div className="interest-copy"><p className="label">{interest.kicker}</p><h3>{interest.title}</h3><p>{interest.text}</p><span className="note">{interest.note}</span></div>
            </article>
          ))}
        </section>

        <section className="contact wrap" id="contact">
          <p className="index">05 / Contact</p>
          <div className="contact-title" data-reveal><h2>Have an idea?<br /><span className="serif">Let’s make it real.</span></h2><p>I’m open to thoughtful conversations, collaborations and opportunities to learn by building.</p></div>
          <div className="contact-links" data-reveal>
            <a href="mailto:hello@mulwamuendo.dev"><span>Email</span><strong>hello@mulwamuendo.dev</strong><Arrow diagonal /></a>
            <a href="https://wa.me/254700000000?text=Hi%20Mulwa%2C%20I%20found%20your%20portfolio%20and%20would%20like%20to%20connect." target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Start a conversation</strong><Arrow diagonal /></a>
            <a href="/demos.html"><span>Project archive</span><strong>View working demos</strong><Arrow diagonal /></a>
          </div>
        </section>
      </main>

      <footer><a className="wordmark" href="#top"><span>Mulwa</span><span>Muendo</span></a><p>Nairobi, Kenya · Building with curiosity</p><p>© {new Date().getFullYear()} Mulwa Muendo</p></footer>
    </div>
  )
}
