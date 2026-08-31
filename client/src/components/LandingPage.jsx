import { useEffect, useRef } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import {
  LightningIcon,
  GoogleIcon,
  GridIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentIcon,
  NetworkIcon,
  TerminalIcon,
  ShieldIcon,
  RocketIcon,
  GaugeIcon,
  TargetIcon,
  UsersIcon,
  DiamondIcon,
} from "./ui/Icons";
import logo from "../../assets/logo.png";

const LAVENDER = "#F1F0FC";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function SignInGoogleButton({ onClick, className = "", variant }) {
  return (
    <Button
      onClick={onClick}
      variant={variant || "primary"}
      className={`rounded-pill px-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 ${className}`}
    >
      <GoogleIcon className="w-5 h-5" />
      Sign in with Google
    </Button>
  );
}

function LogoMark({ className = "w-8 h-8" }) {
  return <img src={logo} alt="SprintZero logo" className={`${className} rounded-[10px]`} />;
}

function Wordmark({ dark = true }) {
  return (
    <span className={`font-display font-bold ${dark ? "text-gray-900" : "text-white"}`}>
      SprintZero
    </span>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

function Navbar({ onSignIn }) {
  return (
    <div className="sticky top-0 z-50 px-4 pt-4 animate-fade-up">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-pill shadow-card border border-line px-5 py-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <LogoMark className="w-8 h-8" />
          <Wordmark />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="#why">Product</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#how">How it Works</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </nav>

        <SignInGoogleButton onClick={onSignIn} className="hidden sm:inline-flex" />
      </div>
    </div>
  );
}

function Hero({ onSignIn }) {
  return (
    <div className="bg-[#F1F0FC] text-center relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 340px at 20% 5%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(600px 340px at 80% 15%, rgba(56,189,248,0.10), transparent 60%)",
        }}
      />
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center relative">
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <Badge className="bg-white text-brand">
            <LightningIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Built with Google Gemini
          </Badge>
        </div>

        <h1
          className="font-display text-5xl sm:text-6xl font-extrabold text-gray-900 mt-6 leading-tight animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          Skip the setup.
          <br></br>
          Ship the sprint.
        </h1>
        <p
          className="text-gray-600 mt-5 text-lg leading-relaxed max-w-2xl mx-auto animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          Upload your brief. SprintZero builds the work breakdown, syncs
          the calendar, and sends kickoff emails before you&apos;d have finished
          writing the ticket yourself.
        </p>

        <div className="mt-8 animate-fade-up" style={{ animationDelay: "380ms" }}>
          <SignInGoogleButton onClick={onSignIn} />
        </div>
      </div>

      <div
        className="max-w-4xl mx-auto px-6 pb-16 animate-fade-up"
        style={{ animationDelay: "500ms" }}
      >
        <HeroVisual />
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="bg-white rounded-[20px] shadow-card p-4 sm:p-6">
      <div
        className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #EDEAFC 0%, #F6F4FF 55%, #E3EEFF 100%)" }}
      >
        <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-10">
          <div className="bg-white rounded-xl shadow-card border border-line p-4 w-44 float-gentle">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-light text-brand mb-3">
              <DocumentIcon className="w-4 h-4" />
            </span>
            <div className="space-y-1.5">
              <div className="h-2 bg-gray-200 rounded w-4/5"></div>
              <div className="h-2 bg-gray-200 rounded w-3/5"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-line p-4 w-52 sm:mt-8 float-gentle float-delay-1">
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-3/5"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              <div className="h-7 bg-brand rounded-lg mt-2 flex items-center px-2">
                <div className="h-1.5 bg-white/70 rounded w-3/4"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-line p-4 w-48 sm:mt-14 float-gentle float-delay-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-light text-brand">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <div className="flex -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-400 border border-white"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-400 border border-white"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white"></span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                <div className="h-2 bg-gray-200 rounded w-3/5"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <DiamondIcon className="w-4 h-4 text-brand" />
      <span className="text-xs font-semibold uppercase tracking-widest text-brand">
        {children}
      </span>
    </div>
  );
}

function WhySection() {
  const cards = [
    {
      title: "Hours back, every sprint",
      desc: "Automate the busywork of translating requirements into actionable timelines.",
    },
    {
      title: "Nothing falls through the dependency graph",
      desc: "AI-driven analysis ensures every blocking task is identified and scheduled correctly.",
    },
    {
      title: "Every meeting starts with an agenda",
      desc: "Context-aware agendas generated instantly, keeping kickoffs focused and efficient.",
    },
  ];

  return (
    <section id="why" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <Eyebrow>Why SprintZero</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 text-center max-w-3xl mx-auto">
            Built for teams who&apos;d rather build than schedule.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 120} className="h-full">
              <Card className="p-8 text-center h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-brand/30">
                <span className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-light text-brand mb-5">
                  <GridIcon className="w-6 h-6" />
                </span>
                <h3 className="font-display font-bold text-gray-900 text-lg">{c.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{c.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Spotlight() {
  return (
    <section className="py-20 px-6" style={{ background: LAVENDER }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Meeting agendas that write themselves
            </h2>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Stop staring at blank documents. SprintZero interprets your brief and
              crafts tailored agendas for every required meeting.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Written from your actual brief, not a template.",
                "Lands directly in the calendar invite nobody copy-pastes it.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-gray-700">
                  <CheckCircleIcon className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <Card className="p-7 shadow-card relative max-w-md md:ml-auto w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
            <Badge className="absolute top-4 right-4 bg-brand-light text-brand">
              AUTO GENERATED
            </Badge>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-light text-brand">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">Sprint Kickoff: Project Phoenix</p>
                <p className="text-sm text-gray-500">Tomorrow, 10:00 AM – 11:00 AM</p>
              </div>
            </div>

            <div className="flex -space-x-2 mt-4">
              <span className="w-5 h-5 rounded-full bg-indigo-400 border-2 border-white"></span>
              <span className="w-5 h-5 rounded-full bg-green-400 border-2 border-white"></span>
              <span className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white"></span>
              <span className="w-5 h-5 rounded-full bg-rose-400 border-2 border-white"></span>
              <span className="w-5 h-5 rounded-full bg-sky-400 border-2 border-white"></span>
            </div>

            <div className="h-px bg-line my-5" />

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Generated Agenda
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Review core objectives from brief",
                "Confirm Phase 1 timeline constraints",
                "Assign ownership for API integration",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 mt-0.5 shrink-0">
                    <CheckCircleIcon className="w-3 h-3" strokeWidth={2.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { Icon: GridIcon, title: "Google Workspace Native", desc: "Deep integration with Docs, Calendar, and Mail." },
    { Icon: NetworkIcon, title: "Dependency Aware Scheduling", desc: "Smart timelines that understand what blocks what." },
    { Icon: TerminalIcon, title: "Live Agent Log", desc: "Transparent view into how the AI is breaking down tasks." },
    { Icon: ShieldIcon, title: "Answers for Ambiguities", desc: "Flags unclear requirements for review instead of guessing." },
    { Icon: ShieldIcon, title: "Secure by Design", desc: "OAuth credentials are stored encrypted with AES-256." },
    { Icon: RocketIcon, title: "Zero Setup Required", desc: "No complex configuration. Just upload and go." },
  ];

  return (
    <section id="how" className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Everything you need to launch faster
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-14">
          {features.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 2) * 100} className="h-full">
              <Card className="p-6 h-full group transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand/30">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-light text-brand mb-4 transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ onSignIn }) {
  return (
    <section id="pricing" className="py-20 bg-shell-content">
      <div className="max-w-xl mx-auto px-6 text-center">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            Simple, transparent access
          </h2>
          <Card className="mt-10 p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
            <h3 className="font-display font-bold text-gray-900 text-xl">Free during early access</h3>
            <p className="text-gray-500 mt-2 text-sm">
              Experience the full power of automated sprint planning while we refine the product.
            </p>
            <div className="mt-6 mb-8">
              <span className="font-display text-6xl font-bold text-gray-900">$0</span>
              <span className="text-xl text-gray-400">/mo</span>
            </div>
            <SignInGoogleButton onClick={onSignIn} className="w-full" />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function StatsRow() {
  const stats = [
    { Icon: GaugeIcon, title: "10x Faster Kickoffs", sub: "Skip the manual setup" },
    { Icon: TargetIcon, title: "Higher Accuracy", sub: "AI catches what humans miss" },
    { Icon: UsersIcon, title: "Instant Alignment", sub: "Everyone on the same page" },
  ];
  return (
    <div className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
        {stats.map(({ Icon, title, sub }, i) => (
          <Reveal key={title} delay={i * 120}>
            <div className="group">
              <span className="mx-auto inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-light text-brand mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                <Icon className="w-5 h-5" />
              </span>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500 mt-1">{sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CtaBand({ onSignIn }) {
  return (
    <section id="contact" className="py-20 px-6" style={{ background: "#4F46E5" }}>
      <Reveal>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Ready to skip Sprint Zero?
          </h2>
          <p className="text-indigo-100 mt-4 text-lg leading-relaxed">
            Join the teams already automating their project setup and focusing on what matters: execution.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={onSignIn}
              className="rounded-pill bg-white text-black hover:bg-gray-50 px-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
            >
              <GoogleIcon className="w-5 h-5" />
              Sign in with Google
            </Button>
            <Button
              onClick={onSignIn}
              className="rounded-pill border border-white text-white bg-transparent hover:bg-brand-dark px-6 transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Custom Demo
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <LogoMark className="w-8 h-8" />
              <Wordmark />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Automating the busywork between the brief and the build.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Product</p>
              <ul className="space-y-3 text-sm text-gray-600">
                {["Features", "Integrations", "Pricing", "Changelog"].map((l) => (
                  <li key={l}><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Company</p>
              <ul className="space-y-3 text-sm text-gray-600">
                {["About", "Blog", "Contact"].map((l) => (
                  <li key={l}><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-px bg-line my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2024 SprintZero. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <span className="text-gray-300">·</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onSignIn }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-clip">
      <Navbar onSignIn={onSignIn} />
      <Hero onSignIn={onSignIn} />
      <WhySection />
      <Spotlight />
      <Features />
      <Pricing onSignIn={onSignIn} />
      <StatsRow />
      <CtaBand onSignIn={onSignIn} />
      <Footer />
    </div>
  );
}
