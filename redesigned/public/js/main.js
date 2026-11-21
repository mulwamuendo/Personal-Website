/*
  main.js
  -------
  Behaviour shared by every page: contact details, header, copy buttons,
  toast messages, back-to-top button and the chat widget.

  LEARNING NOTES
  - Everything is wrapped in (() => { ... })(), called an IIFE. It keeps our
    variables private so they can't clash with other scripts.
  - "$" and "$$" are tiny helpers for document.querySelector / querySelectorAll.
  - We share a few helpers with other scripts through window.MM.
*/
(() => {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Helpers shared with other files ---------- */
  const waLink = (message) =>
    `https://wa.me/${S.whatsappDigits}?text=${encodeURIComponent(message)}`;

  let toastTimer;
  function toast(text) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // Copying can fail (older browsers, restricted frames), so we try the modern
  // way first and fall back to a hidden textarea.
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  window.MM = { waLink, toast, copyText, $, $$ };

  /* ---------- Fill contact details from config.js ---------- */
  const fills = {
    email: S.email,
    whatsapp: S.whatsappDisplay,
    hours: S.hours,
    reply: S.replyTime,
    name: S.name
  };
  $$("[data-contact]").forEach((el) => {
    const key = el.dataset.contact;
    if (key === "address") el.innerHTML = S.addressLines.join("<br>");
    else if (fills[key]) el.textContent = fills[key];
  });
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || "Hi Mulwa, I found your website and would like to talk.");
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Copy buttons ---------- */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy-from]");
    if (!btn) return;
    const source = $(btn.dataset.copyFrom);
    if (!source) return;
    const ok = await copyText(source.textContent.trim());
    toast(ok ? "Copied to clipboard" : "Could not copy. Select the text and copy it manually.");
  });

  /* ---------- Header: shadow, progress bar, mobile menu ---------- */
  const header = $(".site-header");
  const bar = $(".progress span");
  const toTop = $(".to-top");
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $(".menu-toggle");
  if (menuBtn && header) {
    const setOpen = (open) => {
      header.classList.toggle("nav-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    };
    menuBtn.addEventListener("click", () => setOpen(!header.classList.contains("nav-open")));
    $$(".nav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Scroll-spy: highlight the nav link for the section in view ---------- */
  const spyLinks = $$('.nav a[href^="#"]');
  const targets = spyLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if (targets.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        spyLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Chat widget ---------- */
  // This is a simple rule-based bot: it looks for keywords in what the visitor
  // types and picks a canned reply. It is NOT an AI model. A production version
  // would send the message to an AI API along with the business's own FAQ.
  const intents = [
    { keys: ["hello", "hi", "hey", "habari", "jambo", "mambo"], reply: "Hello! I can tell you about website upgrades, automation, timelines or how to get started. What are you curious about?" },
    { keys: ["website", "site", "redesign", "upgrade", "slow", "mobile", "outdated", "old"], reply: "Website upgrades start with a free audit: I check speed, mobile layout, clarity of your message and how easily visitors can contact you. Then you get a written plan with a fixed price. Want to share your site's address on WhatsApp?" },
    { keys: ["automat", "ai", "bot", "reply", "booking", "remind", "report", "spreadsheet", "whatsapp business"], reply: "Automation covers things like instant replies to common questions, online booking with reminders, and turning spreadsheets into weekly reports. You can try working examples on the Demos page." },
    { keys: ["price", "cost", "quote", "how much", "budget", "rate", "pay", "mpesa", "m-pesa"], reply: "Projects are fixed-price. After a free audit you get a written quote with scope, timeline and price, so there are no surprises. Tell me what you need on WhatsApp and I'll prepare it." },
    { keys: ["time", "long", "weeks", "days", "deadline", "fast", "timeline", "when"], reply: "Most small business websites take about 2 to 4 weeks. Simple automations can be live in less. The exact timeline goes in your written quote." },
    { keys: ["demo", "example", "portfolio", "work", "sample"], reply: "The Demos page has three working examples you can click through: an enquiry replier, a booking system with reminders, and a weekly sales report." },
    { keys: ["thank", "thanks", "asante"], reply: "You're welcome! If you'd like to take it further, the WhatsApp button below goes straight to Mulwa." }
  ];
  const fallback = "Good question. That one is best answered by Mulwa directly. Tap \"Continue on WhatsApp\" below and your message will be ready to send.";

  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.type = "button";
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "chat-panel");
  fab.innerHTML = '<span class="dot" aria-hidden="true"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span class="lbl">Chat</span>';

  const panel = document.createElement("section");
  panel.className = "chat-panel";
  panel.id = "chat-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Chat with the site assistant");
  panel.innerHTML = `
    <div class="chat-head">
      <div class="avatar" aria-hidden="true">MM</div>
      <div class="who"><strong>Site assistant</strong><span>Quick answers, then WhatsApp</span></div>
      <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="quick"></div>
    <div class="chat-foot">
      <form class="chat-form" autocomplete="off">
        <label class="sr-only" for="chat-input">Your message</label>
        <input id="chat-input" type="text" placeholder="Type a question..." maxlength="200">
        <button class="btn btn--primary" type="submit">Send</button>
      </form>
      <a class="chat-wa" target="_blank" rel="noopener" href="#">Continue on WhatsApp</a>
    </div>`;
  document.body.append(fab, panel);

  const log = $(".chat-log", panel);
  const quick = $(".quick", panel);
  const form = $(".chat-form", panel);
  const input = $("#chat-input", panel);
  const waBtn = $(".chat-wa", panel);
  let lastUserText = "";
  let started = false;

  function setWa() {
    const msg = lastUserText
      ? `Hi Mulwa, I was chatting on your website. ${lastUserText}`
      : "Hi Mulwa, I found your website and would like to talk.";
    waBtn.href = waLink(msg);
  }
  function addMsg(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function botSay(text) {
    const t = document.createElement("div");
    t.className = "msg bot typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    t.setAttribute("aria-label", "Assistant is typing");
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { t.remove(); addMsg(text, "bot"); }, 650);
  }
  function answer(text) {
    const lower = text.toLowerCase();
    const hit = intents.find((i) => i.keys.some((k) => lower.includes(k)));
    botSay(hit ? hit.reply : fallback);
  }
  function send(text) {
    text = text.trim();
    if (!text) return;
    lastUserText = text;
    addMsg(text, "me");
    setWa();
    answer(text);
  }
  [["I need a website upgrade", "Upgrade my website"], ["What can you automate?", "Automation ideas"], ["How much does it cost?", "Pricing"], ["How long does it take?", "Timeline"]].forEach(([msg, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => send(msg));
    quick.appendChild(b);
  });

  function open(isOpen) {
    panel.hidden = !isOpen;
    fab.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      if (!started) {
        started = true;
        addMsg("Hi, I'm the site assistant. I'm a simple demo bot, so I stick to common questions. For anything detailed I'll hand you over to Mulwa on WhatsApp.", "bot");
      }
      setWa();
      input.focus();
    } else {
      fab.focus();
    }
  }
  fab.addEventListener("click", () => open(panel.hidden));
  $(".chat-close", panel).addEventListener("click", () => open(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) open(false); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
    input.value = "";
  });
  setWa();
})();
