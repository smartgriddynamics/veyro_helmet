import {
  ArrowRight,
  Bluetooth,
  Check,
  Cpu,
  Hand,
  Headphones,
  Menu,
  MessageSquare,
  Mic,
  X,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import HelmetScrollSequence from "./components/HelmetScrollSequence";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Technology", href: "#technology" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
];

const features = [
  {
    icon: Bluetooth,
    number: "01",
    title: "Stay connected",
    description:
      "Connect VEYRO H1 to your smartphone for hands-free calling through an integrated communication system.",
    note: "BLUETOOTH CALLING",
  },
  {
    icon: Mic,
    number: "02",
    title: "Just say the word",
    description:
      "Explore the concept of a custom voice assistant designed to help riders manage calls with natural voice commands.",
    note: "SMARTGRID VOICE",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Speak your message",
    description:
      "Compose and confirm text messages through supported voice commands, reducing the need to interact with a phone.",
    note: "VOICE-CONTROLLED SMS",
  },
  {
    icon: Headphones,
    number: "04",
    title: "Hear clearly",
    description:
      "A planned speaker and microphone system designed for clear communication and awareness of your surroundings.",
    note: "INTEGRATED AUDIO",
  },
  {
    icon: Hand,
    number: "05",
    title: "Simple by design",
    description:
      "Accessible call controls and intuitive interactions, with a distraction-conscious riding experience in mind.",
    note: "INTELLIGENT CONTROLS",
  },
  {
    icon: Cpu,
    number: "06",
    title: "Built to evolve",
    description:
      "VEYRO is envisioned as a platform for future innovations in smart features and connected mobility.",
    note: "FUTURE-READY PLATFORM",
  },
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setStatus("error");
      setMessage("Waitlist registration is not connected yet. Please configure the Supabase environment variables.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please confirm that we may contact you about VEYRO H1.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const { error } = await supabase.from("waitlist_signups").insert({ email: email.trim().toLowerCase() });
      if (error?.code === "23505") {
        setStatus("success");
        setMessage("You're already on the list. We'll be in touch when VEYRO H1 is ready.");
        return;
      }
      if (error) {
        console.error("VEYRO waitlist registration failed:", error);
        setStatus("error");
        setMessage("We couldn't save your registration. Please try again in a moment.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list. We'll be in touch when VEYRO H1 is ready.");
      setEmail("");
    } catch (error) {
      console.error("VEYRO waitlist request failed unexpectedly:", error);
      setStatus("error");
      setMessage("We couldn't save your registration. Please try again in a moment.");
    }
  };

  return (
    <form className="waitlist-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="waitlist-email">
        Email address
      </label>
      <div className="waitlist-form__row">
        <input
          id="waitlist-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={status === "loading" || status === "success"}
        />
        <button className="button button--primary waitlist-form__submit" type="submit" disabled={status === "loading" || status === "success"}>
          {status === "loading" ? "Joining..." : status === "success" ? "You're on the list" : "Join the waitlist"}
          {status === "success" ? <Check size={17} /> : <ArrowRight size={17} />}
        </button>
      </div>
      <label className="waitlist-form__consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={status === "loading" || status === "success"}
        />
        <span>Keep me updated about the VEYRO H1 launch. No spam, ever.</span>
      </label>
      <p className={`waitlist-form__message waitlist-form__message--${status}`} aria-live="polite">
        {message}
      </p>
    </form>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let previous = window.scrollY > 24;
    setScrolled(previous);
    const updateHeader = () => {
      const next = window.scrollY > 24;
      if (next !== previous) {
        previous = next;
        setScrolled(next);
      }
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <>
      <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="VEYRO H1 home" onClick={closeMenu}>
          <span className="brand__name">VEYRO</span>
          <span className="brand__sub">BY SMARTGRID DYNAMICS</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#waitlist">Waitlist</a>
        </nav>

        <a className="button button--nav" href="#waitlist">
          <span>Join waitlist</span>
          <ArrowRight size={15} />
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className={`mobile-nav${menuOpen ? " mobile-nav--open" : ""}`} aria-hidden={!menuOpen}>
        {[...navigation, { label: "Waitlist", href: "#waitlist" }].map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
            {item.label}
            <ArrowRight size={16} />
          </a>
        ))}
        <span>RIDE CONNECTED.</span>
      </div>

      <main>
        <HelmetScrollSequence />

        <section className="technology section-pad" id="technology">
          <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}>
            <p className="eyebrow">Technology designed around riders</p>
            <h2>More than<br />a <span>helmet.</span></h2>
            <p>An intelligent communication experience designed for the road ahead.</p>
          </motion.div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, number, title, description, note }, index) => (
              <motion.article
                className="feature-card"
                key={number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.18 }}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: (index % 3) * 0.08, ease: "easeOut" } },
                }}
              >
                <div className="feature-card__top">
                  <span className="feature-card__icon"><Icon size={20} strokeWidth={1.6} /></span>
                  <span className="feature-card__number">{number}</span>
                </div>
                <div>
                  <p className="feature-card__note">{note}</p>
                  <h3>{title}</h3>
                  <p className="feature-card__description">{description}</p>
                </div>
                {number === "02" && <span className="feature-card__quote">“Hey SmartGrid, call Juma.”</span>}
                {number === "03" && <span className="feature-card__quote">“Send a message to Hamdan.”</span>}
              </motion.article>
            ))}
          </div>
          <p className="technology__note">VEYRO H1 is a pre-launch product concept. Features described are planned capabilities and are not represented as certified or commercially available.</p>
        </section>

        <section className="voice section-pad" id="voice">
          <div className="voice__glow" />
          <motion.div className="voice__intro" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
            <p className="eyebrow">The SmartGrid Voice concept</p>
            <h2>Your voice.<br /><span>In control.</span></h2>
            <p>Thoughtful voice interactions, designed to keep your attention on the road ahead.</p>
          </motion.div>
          <div className="voice__layout">
            <motion.div className="voice-device" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <div className="voice-device__top">
                <span className="voice-device__mark"><span /></span>
                <span>SMARTGRID VOICE</span>
                <span className="voice-device__status"><i /> CONCEPT DEMO</span>
              </div>
              <div className="voice-device__center">
                <div className="voice-device__halo voice-device__halo--outer" />
                <div className="voice-device__halo voice-device__halo--inner" />
                <div className="voice-device__mic"><Mic size={24} strokeWidth={1.5} /></div>
                <div className="waveform" aria-label="Decorative voice waveform">
                  {[17, 26, 38, 22, 48, 34, 56, 27, 44, 20, 36, 50, 25, 41, 18, 30, 45, 22, 35, 17, 29].map((height, index) => (
                    <motion.i key={index} animate={{ scaleY: [0.45, 1, 0.55] }} transition={{ duration: 1 + (index % 4) * 0.22, repeat: Infinity, delay: index * 0.035, ease: "easeInOut" }} style={{ height }} />
                  ))}
                </div>
                <p>Listening for your next command</p>
              </div>
              <div className="voice-device__bottom"><span>VEYRO H1</span><span>VOICE INTERFACE · 01</span></div>
            </motion.div>

            <motion.div className="conversation" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <div className="conversation__heading"><span>01</span><span>AN EVERYDAY MOMENT</span></div>
              <div className="conversation__line conversation__line--rider">
                <span className="conversation__role">RIDER <i /></span>
                <p>“Hey SmartGrid, call Juma.”</p>
              </div>
              <div className="conversation__line conversation__line--assistant">
                <span className="conversation__role"><i /> SMARTGRID VOICE</span>
                <p>“Calling Juma.”</p>
              </div>
              <div className="conversation__separator" />
              <div className="conversation__line conversation__line--rider">
                <span className="conversation__role">RIDER <i /></span>
                <p>“Send a message to Hamdan: I’m on my way.”</p>
              </div>
              <div className="conversation__line conversation__line--assistant">
                <span className="conversation__role"><i /> SMARTGRID VOICE</span>
                <p>“Your message is ready. Should I send it?”</p>
              </div>
              <p className="conversation__disclaimer">Illustrative concept interaction. Actual features and availability may differ.</p>
            </motion.div>
          </div>
        </section>

        <section className="about section-pad" id="about">
          <motion.div className="about__inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}>
            <div>
              <p className="eyebrow">A new point of view</p>
              <h2>Ride<br /><span>connected.</span></h2>
            </div>
            <div className="about__copy">
              <p className="about__lead">A smarter ride begins with a better connection.</p>
              <p>VEYRO H1 is a SmartGrid Dynamics product concept exploring how thoughtful technology can bring riders closer to the people and information that matter — without losing sight of the journey.</p>
              <span className="about__signature">SMARTGRID DYNAMICS <i /> MOBILITY, REIMAGINED</span>
            </div>
          </motion.div>
          <div className="about__line" />
        </section>

        <section className="waitlist section-pad" id="waitlist">
          <div className="waitlist__ambient" />
          <motion.div className="waitlist__content" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
            <p className="eyebrow"><span className="eyebrow__dot" /> Early access</p>
            <h2>Be there<br />from the <span>beginning.</span></h2>
            <p>Get launch updates and be among the first to experience the VEYRO H1 vision.</p>
            <WaitlistForm />
            <span className="waitlist__fineprint">By joining, you agree to receive product updates from SmartGrid Dynamics.</span>
          </motion.div>
          <div className="waitlist__side-label">VEYRO H1 · PRE-LAUNCH</div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand brand--footer" href="#home">
          <span className="brand__name">VEYRO</span>
          <span className="brand__sub">BY SMARTGRID DYNAMICS</span>
        </a>
        <p>Ride connected. <span>© {new Date().getFullYear()} SmartGrid Dynamics</span></p>
        <a href="#home" className="footer__top">BACK TO TOP <ArrowRight size={14} /></a>
        <span className="footer__concept">A PRODUCT CONCEPT · BUILT FOR WHAT’S NEXT</span>
      </footer>
    </>
  );
}

export default App;
