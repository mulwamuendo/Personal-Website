/*
  config.js
  ---------
  The ONE place for your contact details and key promises.
  Every element in the HTML with a data-contact="..." attribute gets its text
  from here, and the chat widget and forms build their WhatsApp links from it.

  LEARNING NOTE: window.SITE is a "global object". Other scripts read it with
  window.SITE.email, and so on. Change a value here, refresh, and it updates
  everywhere. That is the idea behind "don't repeat yourself" (DRY).

  PLACEHOLDERS: the email, phone number and address below are made up.
  Replace them with your real details before sharing the site.
*/
window.SITE = {
  name: "Mulwa Muendo",
  email: "hello@mulwamuendo.dev",
  whatsappDisplay: "+254 700 000 000",
  whatsappDigits: "254700000000", // country code + number, digits only, no "+"
  addressLines: ["Westlands Business Park", "Waiyaki Way, Nairobi", "Kenya"],
  hours: "Mon to Sat, 8:00 to 18:00 (EAT)",
  replyTime: "within 24 hours"
};
