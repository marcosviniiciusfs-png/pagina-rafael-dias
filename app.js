(() => {
  const config = window.LP_CONFIG || {};
  const phone = String(config.whatsappNumber || "559491830101").replace(/\D/g, "");
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = `https://wa.me/${phone}`;
    link.addEventListener("click", () => window.fbq?.("track", "Contact"));
  });

  const header = document.querySelector("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 26);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  button?.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menu.hidden = true;
    button?.setAttribute("aria-expanded", "false");
  }));

  document.querySelectorAll("[data-comparison]").forEach((comparison) => {
    const range = comparison.querySelector("[data-comparison-range]");
    const before = comparison.querySelector("[data-before]");
    const handle = comparison.querySelector("[data-comparison-handle]");
    const update = () => {
      const value = `${range.value}%`;
      before.style.width = value;
      handle.style.left = value;
    };
    range.addEventListener("input", update);
    update();
  });

  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
})();
