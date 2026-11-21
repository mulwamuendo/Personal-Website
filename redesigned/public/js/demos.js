/*
  demos.js
  --------
  The three demos. Read it top to bottom: each demo is a small self-contained
  block that follows the same pattern:
      data  ->  a function that works on the data  ->  code that draws the result

  LEARNING NOTES
  - "const" for values that never get reassigned, "let" for ones that do.
  - Arrays (lists) and objects ({ key: value }) are the two shapes of data you
    will use in almost every program, in JavaScript and in Python alike.
  - textContent is safer than innerHTML for user input, because it never
    interprets text as HTML (this prevents a class of attack called XSS).
*/
(() => {
  const { $, $$ } = window.MM;

  /* =====================================================
     DEMO 1: Enquiry replier (keyword matching)
     ===================================================== */
  const BUSINESS = "Mama Wanjiru's Bakery";
  const faq = [
    { topic: "Delivery", keys: ["deliver", "delivery", "kitengela", "ngong", "send", "courier", "location", "juja", "thika"],
      answer: "We deliver across Nairobi and nearby towns. Delivery within Nairobi is same day for orders placed before 2pm, and farther areas are next day." },
    { topic: "Opening hours", keys: ["open", "close", "closing", "hours", "time", "sunday"],
      answer: "We're open Monday to Saturday from 7am to 7pm, and Sunday from 9am to 2pm." },
    { topic: "Custom cakes", keys: ["custom", "birthday", "wedding", "design", "tier", "bespoke"],
      answer: "We make custom cakes for birthdays, weddings and events. Please order at least 3 days ahead and tell us the size, flavour and any design ideas." },
    { topic: "Prices", keys: ["price", "cost", "much", "quote", "cheap", "budget"],
      answer: "Prices depend on size and design. Cupcakes start from KES 150 each and custom cakes from KES 2,500. Tell us what you have in mind and we'll send an exact quote." },
    { topic: "Payment", keys: ["mpesa", "m-pesa", "pay", "payment", "card", "cash", "deposit"],
      answer: "You can pay by M-Pesa, card or cash. Custom orders need a 50% deposit to confirm the booking." },
    { topic: "Dietary needs", keys: ["nut", "nuts", "gluten", "vegan", "allergy", "allergic", "eggless", "sugar", "diabetic"],
      answer: "We can make eggless and vegan cakes, and we label every product that contains nuts. For allergies, please tell us in advance so we can prepare safely." }
  ];
  const samples = [
    "Hi, do you deliver to Kitengela? I need a cake on Saturday.",
    "What time do you close today?",
    "How much is a custom birthday cake and can I pay by M-Pesa?",
    "My son is allergic to nuts. Is the chocolate cake safe?",
    "I'd like to speak to the manager about a complaint, please."
  ];

  function draftReply(message) {
    const words = message.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
    // Score every topic: how many of its keywords appear in the message?
    const scored = faq.map((item) => ({
      item,
      hits: item.keys.filter((k) => words.includes(k)).length
    })).filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);
    return scored; // best match first
  }

  const replyInput = $("#reply-input");
  const replyOut = $("#reply-out");
  if (replyInput) {
    const sampleBox = $("#reply-samples");
    samples.forEach((text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text.length > 46 ? text.slice(0, 44) + "..." : text;
      b.title = text;
      b.addEventListener("click", () => { replyInput.value = text; run(); });
      sampleBox.appendChild(b);
    });

    function run() {
      const message = replyInput.value.trim();
      if (!message) {
        replyOut.innerHTML = '<p class="muted" style="margin:0">Type a message or pick a sample, then press Draft reply.</p>';
        return;
      }
      const matches = draftReply(message);
      replyOut.textContent = "";

      const meta = document.createElement("div");
      meta.className = "reply-meta meta";
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      if (matches.length === 0) {
        meta.innerHTML = '<span class="pill warn">No confident match</span><span class="pill">Sent to a human</span>';
        bubble.textContent = `Hi there, thanks for contacting ${BUSINESS}. I want to make sure you get the right answer, so I've passed your message to the owner. She will reply shortly.`;
      } else {
        const top = matches[0];
        const topics = matches.map((m) => m.item.topic);
        meta.innerHTML = `<span class="pill good">Matched: ${topics.join(" + ")}</span><span class="pill">${top.hits} keyword${top.hits > 1 ? "s" : ""} found</span>`;
        // If the message touches several topics, answer them all in one reply.
        const answers = matches.slice(0, 3).map((m) => m.item.answer).join(" ");
        bubble.textContent = `Hi there, thanks for contacting ${BUSINESS}! ${answers} Anything else I can help with?`;
      }
      replyOut.append(meta, bubble);
    }
    $("#reply-btn").addEventListener("click", run);
    replyInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(); });
  }

  /* =====================================================
     DEMO 2: Booking with reminders
     ===================================================== */
  const daysBox = $("#book-days");
  if (daysBox) {
    const CLINIC = "Sunrise Physio Clinic";
    const TIMES = [[9, 0], [10, 30], [12, 0], [14, 0], [15, 30], [17, 0]];
    const taken = new Set();   // ids of slots that are already booked
    let selected = null;       // { id, date } of the slot the visitor picked

    const pad = (n) => String(n).padStart(2, "0");
    const timeLabel = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const dayLabel = (d) => d.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "short" });
    const shortDay = (d) => d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });

    // Build the next 5 working days (skip Sundays), starting tomorrow
    const days = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.length < 5) {
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() !== 0) days.push(new Date(cursor));
    }
    // Pretend some slots are already booked so the calendar feels real
    days.forEach((d, di) => TIMES.forEach((_, ti) => { if ((di * 7 + ti * 3) % 5 === 0) taken.add(`${di}-${ti}`); }));

    const bookBtn = $("#book-btn");
    const resultBox = $("#book-result");

    function renderDays() {
      daysBox.textContent = "";
      days.forEach((d, di) => {
        const row = document.createElement("div");
        row.className = "day";
        const label = document.createElement("div");
        label.className = "dl";
        label.innerHTML = `${d.toLocaleDateString("en-KE", { weekday: "short" })}<small>${d.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</small>`;
        const slots = document.createElement("div");
        slots.className = "slots";
        TIMES.forEach(([h, m], ti) => {
          const when = new Date(d);
          when.setHours(h, m, 0, 0);
          const id = `${di}-${ti}`;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "slot";
          b.textContent = timeLabel(when);
          const isTaken = taken.has(id);
          b.disabled = isTaken;
          b.setAttribute("aria-pressed", String(selected && selected.id === id));
          b.setAttribute("aria-label", `${dayLabel(when)} at ${timeLabel(when)}${isTaken ? ", already booked" : ""}`);
          b.addEventListener("click", () => { selected = { id, date: when }; renderDays(); syncButton(); });
          slots.appendChild(b);
        });
        row.append(label, slots);
        daysBox.appendChild(row);
      });
    }
    function syncButton() {
      bookBtn.disabled = !selected;
      bookBtn.textContent = selected ? `Book ${shortDay(selected.date)} at ${timeLabel(selected.date)}` : "Choose a time first";
    }

    function bubble(text, incoming) {
      const el = document.createElement("div");
      el.className = "bubble" + (incoming ? " in" : "");
      el.textContent = text;
      return el;
    }

    $("#book-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!selected) return;
      const nameField = $("#bf-name");
      const name = $("#book-name").value.trim();
      nameField.classList.toggle("invalid", !name);
      $(".err", nameField).textContent = name ? "" : "Please enter a name.";
      if (!name) { $("#book-name").focus(); return; }

      const first = name.split(/\s+/)[0];
      const when = selected.date;
      taken.add(selected.id);      // block the slot straight away
      const dayText = dayLabel(when);
      const t = timeLabel(when);
      const hoursBefore = (h) => new Date(when.getTime() - h * 3600 * 1000);
      const stamp = (d) => `${d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })}, ${timeLabel(d)}`;

      resultBox.textContent = "";
      const box = document.createElement("div");
      box.className = "confirm";
      box.innerHTML = `<h3>Booked</h3><div>${first}, your appointment is set for <strong></strong>. That slot is now blocked for everyone else.</div>`;
      $("strong", box).textContent = `${dayText} at ${t}`;

      const list = document.createElement("ol");
      list.className = "timeline";
      [
        ["Sent now", `Hi ${first}, your appointment at ${CLINIC} is confirmed for ${dayText} at ${t}. Reply 1 to confirm or 2 to reschedule.`, false],
        [`Scheduled for ${stamp(hoursBefore(24))}`, `Reminder: you're booked tomorrow at ${t} at ${CLINIC}. Please arrive 10 minutes early.`, false],
        [`Scheduled for ${stamp(hoursBefore(2))}`, `See you at ${t} today, ${first}. Reply here if you're running late.`, false]
      ].forEach(([when2, text]) => {
        const li = document.createElement("li");
        const w = document.createElement("span");
        w.className = "when";
        w.textContent = when2;
        li.append(w, bubble(text, false));
        list.appendChild(li);
      });
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "btn btn--ghost btn--small";
      reset.style.marginTop = "14px";
      reset.textContent = "Book another time";
      reset.addEventListener("click", () => { resultBox.textContent = ""; });
      box.append(list, reset);
      resultBox.appendChild(box);

      selected = null;
      $("#book-name").value = "";
      $("#book-phone").value = "";
      renderDays();
      syncButton();
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    renderDays();
    syncButton();
  }

  /* =====================================================
     DEMO 3: Weekly sales report
     ===================================================== */
  const csvInput = $("#csv-input");
  if (csvInput) {
    const money = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
    const out = $("#csv-out");
    const errBox = $("#csv-err");

    // Build 14 days of believable sample data. The second week is a little stronger.
    function sampleCsv() {
      const products = [["Loaf bread", 8, 70], ["Birthday cake", 1, 2800], ["Cupcakes (box)", 4, 600], ["Mandazi (pack)", 10, 120]];
      const start = Date.UTC(2026, 9, 12); // 12 October 2026
      const lines = ["date,product,units,price"];
      for (let d = 0; d < 14; d++) {
        const date = new Date(start + d * 86400000).toISOString().slice(0, 10);
        products.forEach(([name, base, price], i) => {
          const wave = (d * 5 + i * 3) % 4;               // small ups and downs
          const growth = d >= 7 ? Math.ceil(base * 0.25) : 0; // second week sells more
          const weekend = [5, 6, 12, 13].includes(d) ? Math.ceil(base * 0.5) : 0;
          lines.push(`${date},${name},${base + wave + growth + weekend},${price}`);
        });
      }
      return lines.join("\n");
    }

    // Turn the pasted text into an array of row objects. Returns { rows, skipped }.
    function parse(text) {
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) throw new Error("Add a header line and at least one row of data.");
      const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const idx = ["date", "product", "units", "price"].map((k) => header.indexOf(k));
      if (idx.includes(-1)) throw new Error("The first line must be: date,product,units,price");
      const rows = [];
      let skipped = 0;
      lines.slice(1).forEach((line) => {
        const c = line.split(",").map((x) => x.trim());
        const units = Number(c[idx[2]]);
        const price = Number(c[idx[3]]);
        const date = c[idx[0]];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !c[idx[1]] || !Number.isFinite(units) || !Number.isFinite(price)) { skipped++; return; }
        rows.push({ date, product: c[idx[1]], units, revenue: units * price });
      });
      if (!rows.length) throw new Error("No valid rows found. Check the dates are like 2026-10-12 and units and price are numbers.");
      return { rows, skipped };
    }

    // Add up revenue per key (a day, or a product)
    function groupSum(rows, keyFn) {
      const map = new Map();
      rows.forEach((r) => map.set(keyFn(r), (map.get(keyFn(r)) || 0) + r.revenue));
      return map;
    }

    function niceMax(v) {
      const step = Math.pow(10, Math.floor(Math.log10(v)));
      return Math.ceil(v / step) * step;
    }

    function chartSvg(dayEntries) {
      const W = 640, H = 230, L = 52, R = 12, T = 14, B = 34;
      const max = niceMax(Math.max(...dayEntries.map((d) => d[1])));
      const best = Math.max(...dayEntries.map((d) => d[1]));
      const plotW = W - L - R, plotH = H - T - B;
      const slot = plotW / dayEntries.length;
      const bw = Math.min(34, slot * 0.64);
      const y = (v) => T + plotH - (v / max) * plotH;
      const fmt = (v) => (v >= 1000 ? (v / 1000) + "k" : String(v));
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of revenue per day">`;
      for (let i = 0; i <= 4; i++) {
        const v = (max / 4) * i;
        s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
      }
      dayEntries.forEach(([date, v], i) => {
        const x = L + slot * i + (slot - bw) / 2;
        const h = (v / max) * plotH;
        const label = date.slice(8) + "/" + date.slice(5, 7);
        s += `<rect class="bar${v === best ? " top" : ""}" x="${x}" y="${y(v)}" width="${bw}" height="${h}" rx="3"><title>${label}: ${money.format(v)}</title></rect>`;
        if (dayEntries.length <= 16 || i % 2 === 0) s += `<text class="axis" x="${x + bw / 2}" y="${H - 12}" text-anchor="middle">${label}</text>`;
      });
      return s + "</svg>";
    }

    function render() {
      errBox.textContent = "";
      let parsed;
      try { parsed = parse(csvInput.value); } catch (e) { errBox.textContent = e.message; out.textContent = ""; return; }
      const { rows, skipped } = parsed;

      const byDay = [...groupSum(rows, (r) => r.date)].sort((a, b) => a[0].localeCompare(b[0]));
      const byProduct = [...groupSum(rows, (r) => r.product)].sort((a, b) => b[1] - a[1]);
      const total = rows.reduce((s, r) => s + r.revenue, 0);
      const units = rows.reduce((s, r) => s + r.units, 0);
      const bestDay = byDay.reduce((a, b) => (b[1] > a[1] ? b : a));
      const avg = total / byDay.length;

      // Week-over-week: last 7 days vs the 7 days before (needs at least 8 days of data)
      let change = null;
      if (byDay.length >= 8) {
        const last = byDay.slice(-7).reduce((s, d) => s + d[1], 0);
        const prev = byDay.slice(-14, -7).reduce((s, d) => s + d[1], 0);
        if (prev > 0) change = ((last - prev) / prev) * 100;
      }
      const dayName = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "short" });

      const changeHtml = change === null ? "" : `<em class="${change >= 0 ? "up" : "down"}">${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous week</em>`;
      out.innerHTML = `
        <div class="kpis">
          <div class="kpi"><span>Total revenue</span><strong>${money.format(total)}</strong>${changeHtml}</div>
          <div class="kpi"><span>Units sold</span><strong>${units.toLocaleString("en-KE")}</strong></div>
          <div class="kpi"><span>Average per day</span><strong>${money.format(avg)}</strong></div>
          <div class="kpi"><span>Best product</span><strong></strong></div>
          <div class="kpi"><span>Best day</span><strong></strong></div>
          <div class="kpi"><span>Days covered</span><strong>${byDay.length}</strong></div>
        </div>
        ${chartSvg(byDay)}
        <p class="fine" style="margin:6px 0 0">Revenue per day (KES). The best day is highlighted.</p>
        <div class="summary-text" id="csv-summary"></div>
        <div style="margin-top:12px"><button class="btn btn--ghost btn--small" type="button" id="csv-copy">Copy summary</button></div>`;
      const kpis = $$(".kpi strong", out);
      kpis[3].textContent = `${byProduct[0][0]}`;
      kpis[4].textContent = dayName(bestDay[0]);

      const trend = change === null ? "" : ` Revenue is ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% on the previous week.`;
      const summary = `Weekly summary: sales totalled ${money.format(total)} across ${byDay.length} days (${units.toLocaleString("en-KE")} units).${trend} ${byProduct[0][0]} was the top product at ${money.format(byProduct[0][1])}, and ${dayName(bestDay[0])} was the strongest day.` + (skipped ? ` (${skipped} line${skipped > 1 ? "s" : ""} could not be read and ${skipped > 1 ? "were" : "was"} skipped.)` : "");
      $("#csv-summary").textContent = summary;
      $("#csv-copy").addEventListener("click", async () => {
        const ok = await window.MM.copyText(summary);
        window.MM.toast(ok ? "Summary copied" : "Could not copy. Select the text and copy it manually.");
      });
    }

    csvInput.value = sampleCsv();
    $("#csv-btn").addEventListener("click", render);
    $("#csv-reset").addEventListener("click", () => { csvInput.value = sampleCsv(); render(); });
    render();
  }
})();
