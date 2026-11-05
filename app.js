(() => {
  "use strict";

  const config = window.LP_CONFIG || {};
  const dataLayer = (window.dataLayer = window.dataLayer || []);

  const track = (event, parameters = {}) => {
    dataLayer.push({ event, ...parameters });
  };

  const installGtm = () => {
    if (!config.gtmId) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`;
    document.head.append(script);
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  };

  const installClarity = () => {
    const clarityId = String(config.clarityProjectId || "").trim();
    if (!clarityId) return;
    window.clarity = window.clarity || function clarityQueue() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`;
    document.head.append(script);
  };

  installGtm();
  installClarity();
  track("view_landing_page");

  const whatsappNumber = String(config.whatsappNumber || "559491830101").replace(/\D/g, "");
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = `https://wa.me/${whatsappNumber}`;
    link.addEventListener("click", () => {
      track("click_whatsapp", { position: link.dataset.whatsappPosition || "unknown" });
    });
  });

  const revealElements = document.querySelectorAll(".reveal:not(.is-visible)");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const heroVideo = document.querySelector(".hero__video");
  const heroToggle = document.querySelector('[data-media-toggle="hero"]');
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setHeroPaused = (paused) => {
    if (!heroVideo || !heroToggle) return;
    if (paused) heroVideo.pause();
    else heroVideo.play().catch(() => {});
    heroToggle.setAttribute("aria-pressed", String(paused));
    const label = paused ? "Reproduzir vídeo" : "Pausar vídeo";
    heroToggle.setAttribute("aria-label", label);
    heroToggle.querySelector(".media-toggle__label").textContent = label;
  };

  if (reduceMotion.matches) setHeroPaused(true);
  heroToggle?.addEventListener("click", () => {
    const shouldPause = heroToggle.getAttribute("aria-pressed") !== "true";
    setHeroPaused(shouldPause);
    track("video_control", { video: "hero", action: shouldPause ? "pause" : "play" });
  });

  const carousel = document.querySelector(".carousel");
  const carouselTrack = document.querySelector(".carousel__track");
  let carouselTracked = false;

  const trackCarouselInteraction = () => {
    if (carouselTracked) return;
    carouselTracked = true;
    track("carousel_interaction");
  };
  carousel?.addEventListener("pointerdown", trackCarouselInteraction, { once: true });
  carousel?.addEventListener("keydown", trackCarouselInteraction, { once: true });

  if (carousel && carouselTrack && !reduceMotion.matches) {
    // A faixa tem os casos duplicados; ao passar da metade voltamos ao início sem salto visível.
    const autoSpeed = 0.04; // px por ms
    const resumeDelay = 2200;
    let position = carousel.scrollLeft;
    let previousTime = 0;
    let visible = true;
    let mouseDragging = false;
    let touching = false;
    let resumeTimer = 0;
    let mouseStartX = 0;
    let mouseStartScroll = 0;

    const halfTrack = () => carouselTrack.scrollWidth / 2;
    const wrap = () => {
      const half = halfTrack();
      if (half <= 0) return;
      if (position >= half) position -= half;
      if (position < 0) position += half;
    };

    const pauseAuto = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = 0;
    };
    const resumeAutoLater = () => {
      pauseAuto();
      resumeTimer = window.setTimeout(() => {
        resumeTimer = 0;
        position = carousel.scrollLeft;
        wrap();
      }, resumeDelay);
    };
    const isAutoPaused = () => mouseDragging || touching || resumeTimer !== 0 || !visible || document.hidden;

    const advanceCarousel = (time) => {
      if (previousTime && !isAutoPaused() && halfTrack() > 0) {
        // `position` guarda o valor fracionário: scrollLeft é arredondado em vários celulares,
        // e somar frações direto nele faria a rolagem travar.
        position += Math.min(time - previousTime, 64) * autoSpeed;
        wrap();
        carousel.scrollLeft = position;
      }
      previousTime = time;
      requestAnimationFrame(advanceCarousel);
    };
    requestAnimationFrame(advanceCarousel);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) position = carousel.scrollLeft;
      }).observe(carousel);
    }

    // Evita que o navegador arraste a própria imagem.
    carousel.addEventListener("dragstart", (event) => event.preventDefault());

    // Toque: a rolagem horizontal é nativa (com inércia); só pausamos a automática.
    carousel.addEventListener("touchstart", () => {
      touching = true;
      pauseAuto();
    }, { passive: true });
    const endTouch = () => {
      touching = false;
      resumeAutoLater();
    };
    carousel.addEventListener("touchend", endTouch, { passive: true });
    carousel.addEventListener("touchcancel", endTouch, { passive: true });
    carousel.addEventListener("scroll", () => {
      if (touching || resumeTimer) resumeAutoLater();
    }, { passive: true });

    // Mouse: arraste manual com o botão esquerdo.
    carousel.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      mouseDragging = true;
      mouseStartX = event.clientX;
      mouseStartScroll = carousel.scrollLeft;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture?.(event.pointerId);
    });
    carousel.addEventListener("pointermove", (event) => {
      if (!mouseDragging) return;
      carousel.scrollLeft = mouseStartScroll - (event.clientX - mouseStartX) * 1.35;
    });
    const stopMouseDrag = (event) => {
      if (!mouseDragging) return;
      mouseDragging = false;
      carousel.classList.remove("is-dragging");
      if (event?.pointerId !== undefined && carousel.hasPointerCapture?.(event.pointerId)) carousel.releasePointerCapture(event.pointerId);
      position = carousel.scrollLeft;
    };
    carousel.addEventListener("pointerup", stopMouseDrag);
    carousel.addEventListener("pointercancel", stopMouseDrag);
  }

  // Dica de rolagem no topo (mobile): a página "puxa" para baixo e volta a cada 5 s.
  const scrollHintQuery = window.matchMedia("(max-width: 767px)");
  const mainElement = document.querySelector("main");
  if (mainElement && !reduceMotion.matches) {
    let touchingScreen = false;
    window.addEventListener("touchstart", () => (touchingScreen = true), { passive: true });
    window.addEventListener("touchend", () => (touchingScreen = false), { passive: true });
    window.addEventListener("touchcancel", () => (touchingScreen = false), { passive: true });
    mainElement.addEventListener("animationend", (event) => {
      if (event.animationName === "scroll-hint") mainElement.classList.remove("is-scroll-hint");
    });
    window.setInterval(() => {
      if (!scrollHintQuery.matches || touchingScreen || document.hidden) return;
      if (window.scrollY > 4 || document.body.classList.contains("modal-open")) return;
      mainElement.classList.remove("is-scroll-hint");
      void mainElement.offsetWidth;
      mainElement.classList.add("is-scroll-hint");
    }, 5000);
  }

  // Vídeos: todos tocam sozinhos; o som é exclusivo (só um vídeo com áudio por vez).
  const soundVideos = [...document.querySelectorAll("video[data-sound-video]")];
  const soundButtons = new Map(
    [...document.querySelectorAll("[data-sound-toggle]")].map((button) => [button.dataset.soundToggle, button]),
  );
  const testimonialVideo = soundVideos.find((video) => video.dataset.soundVideo === "testimonial");
  let testimonialAutoUnmuted = false;

  const updateSoundButtons = () => {
    soundButtons.forEach((button, name) => {
      const video = soundVideos.find((item) => item.dataset.soundVideo === name);
      const on = Boolean(video && !video.muted);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", on ? "Desativar som do vídeo" : "Ativar som do vídeo");
    });
  };

  const setActiveAudio = (activeVideo) => {
    soundVideos.forEach((video) => {
      const shouldMute = video !== activeVideo;
      if (video.muted !== shouldMute) video.muted = shouldMute;
      if (!shouldMute) video.volume = 1;
    });
    updateSoundButtons();
  };

  soundButtons.forEach((button, name) => {
    const video = soundVideos.find((item) => item.dataset.soundVideo === name);
    button.addEventListener("click", () => {
      if (!video) return;
      const enable = video.muted;
      setActiveAudio(enable ? video : null);
      if (enable && video.paused) video.play().catch(() => {});
      track("video_control", { video: name, action: enable ? "unmute" : "mute" });
    });
  });

  // Controles nativos do depoimento: se o som for ligado por lá, silencia os demais.
  soundVideos.forEach((video) => {
    video.addEventListener("volumechange", () => {
      if (!video.muted) {
        soundVideos.forEach((other) => {
          if (other !== video && !other.muted) other.muted = true;
        });
      }
      updateSoundButtons();
    });
  });

  const heroManuallyPaused = () => heroToggle?.getAttribute("aria-pressed") === "true";

  const playVideo = (video) => {
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
  };

  const tryTestimonialWithSound = () => {
    if (!testimonialVideo || testimonialAutoUnmuted) return;
    if (soundVideos.some((video) => video !== testimonialVideo && !video.muted)) return;
    testimonialAutoUnmuted = true;
    testimonialVideo.muted = false;
    const attempt = testimonialVideo.play();
    if (attempt?.catch) {
      attempt.catch(() => {
        // O navegador bloqueou som automático: segue mudo e libera no primeiro toque na página.
        testimonialVideo.muted = true;
        playVideo(testimonialVideo);
        testimonialAutoUnmuted = false;
      });
    }
  };

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const inView = entry.intersectionRatio >= 0.35;
          if (inView) {
            if (video === heroVideo && (heroManuallyPaused() || reduceMotion.matches)) return;
            if (video === testimonialVideo) tryTestimonialWithSound();
            playVideo(video);
          } else if (entry.intersectionRatio < 0.1) {
            if (!video.muted) setActiveAudio(null);
            if (video === heroVideo && heroManuallyPaused()) return;
            video.pause();
          }
        });
      },
      { threshold: [0, 0.1, 0.35, 0.6] },
    );
    soundVideos.forEach((video) => videoObserver.observe(video));
  }

  // Primeiro toque/clique: libera o som do depoimento se o autoplay com áudio foi bloqueado.
  const unlockTestimonialSound = () => {
    if (!testimonialVideo || !testimonialVideo.muted || testimonialAutoUnmuted) return;
    if (soundVideos.some((video) => video !== testimonialVideo && !video.muted)) return;
    const rect = testimonialVideo.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35;
    if (!inView || testimonialVideo.paused) return;
    testimonialAutoUnmuted = true;
    setActiveAudio(testimonialVideo);
  };
  ["pointerdown", "touchend", "click", "keydown"].forEach((type) => {
    window.addEventListener(type, unlockTestimonialSound, { passive: true });
  });

  document.querySelectorAll("video[data-track-video]").forEach((video) => {
    const videoName = video.dataset.trackVideo;
    const milestones = new Set();

    const trackStart = () => {
      if (milestones.has("start")) return;
      milestones.add("start");
      track("video_start", { video: videoName });
    };

    const trackComplete = () => {
      if (milestones.has("complete")) return;
      milestones.add("complete");
      track("video_complete", { video: videoName });
    };

    video.addEventListener("play", trackStart);
    if (!video.paused) trackStart();

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const progress = video.currentTime / video.duration;
      if (progress >= 0.25 && !milestones.has("25")) {
        milestones.add("25");
        track("video_25", { video: videoName });
      }
      if (progress >= 0.95) trackComplete();
    });

    video.addEventListener("ended", trackComplete);
  });

  const modal = document.querySelector("#lead-modal");
  const form = document.querySelector("#lead-form");
  const openButtons = document.querySelectorAll(".js-open-form");
  const closeButton = modal?.querySelector(".lead-modal__close");
  const backButton = form?.querySelector(".form-back");
  const nextButton = form?.querySelector(".form-next");
  const submitButton = form?.querySelector(".form-submit");
  const formStatus = form?.querySelector(".form-status");
  const steps = form ? [...form.querySelectorAll(".form-step")] : [];
  let currentStep = 1;
  let opener = null;

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const searchParams = new URLSearchParams(window.location.search);
  utmKeys.forEach((key) => {
    const field = form?.elements.namedItem(key);
    if (field) field.value = searchParams.get(key) || "";
  });

  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const updateStep = (nextStep, direction = "forward") => {
    currentStep = Math.max(1, Math.min(steps.length, nextStep));
    steps.forEach((step, index) => {
      const active = index + 1 === currentStep;
      step.classList.toggle("is-active", active);
      step.hidden = !active;
    });

    modal.querySelectorAll("[data-progress]").forEach((item) => {
      const stepNumber = Number(item.dataset.progress);
      item.classList.toggle("is-active", stepNumber === currentStep);
      item.classList.toggle("is-complete", stepNumber < currentStep);
      if (stepNumber === currentStep) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === steps.length;
    submitButton.hidden = currentStep !== steps.length;
    formStatus.textContent = `Etapa ${currentStep} de ${steps.length}`;

    const activeField = steps[currentStep - 1].querySelector("input:not([type='radio']):not([type='checkbox']), input[type='radio']");
    window.setTimeout(() => activeField?.focus(), direction === "initial" ? 80 : 30);
  };

  const clearError = (field) => {
    field.removeAttribute("aria-invalid");
    const errorId = field.getAttribute("aria-describedby");
    if (errorId) {
      const error = document.getElementById(errorId);
      if (error) error.textContent = "";
    }
  };

  const setError = (field, message, errorElement) => {
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorElement.id);
    errorElement.textContent = message;
    field.focus();
    return false;
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep - 1];
    const name = form.elements.namedItem("name");
    const phone = form.elements.namedItem("phone");
    const email = form.elements.namedItem("email");
    const errorElement = step.querySelector(".field-error");

    if (currentStep === 1) {
      clearError(name);
      clearError(phone);
      clearError(email);
      if (name.value.trim().length < 2) return setError(name, "Informe seu nome completo para continuar.", errorElement);
      if (phone.value.replace(/\D/g, "").length < 10) return setError(phone, "Informe um WhatsApp com DDD.", errorElement);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return setError(email, "Informe um e-mail válido.", errorElement);
      return true;
    }

    const choice = step.querySelector('input[type="radio"]');
    const answered = step.querySelector('input[type="radio"]:checked');
    clearError(choice);
    if (!answered) return setError(choice, "Escolha uma opção para continuar.", errorElement);
    return true;
  };

  const openModal = (button) => {
    if (!modal || !form) return;
    opener = button;
    track("click_schedule_cta", { position: button.dataset.ctaPosition || "unknown" });
    form.reset();
    utmKeys.forEach((key) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = searchParams.get(key) || "";
    });
    form.querySelectorAll("[aria-invalid]").forEach(clearError);
    form.querySelectorAll(".field-error").forEach((error) => (error.textContent = ""));
    updateStep(1, "initial");
    modal.showModal();
    document.body.classList.add("modal-open");
    track("open_lead_form", { position: button.dataset.ctaPosition || "unknown" });
  };

  const closeModal = () => {
    if (!modal?.open) return;
    modal.close();
    document.body.classList.remove("modal-open");
    window.setTimeout(() => opener?.focus(), 0);
  };

  openButtons.forEach((button) => button.addEventListener("click", () => openModal(button)));
  closeButton?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  modal?.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  modal?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll(focusableSelector)].filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    track("form_step_complete", { step: currentStep });
    updateStep(currentStep + 1);
  });

  backButton?.addEventListener("click", () => updateStep(currentStep - 1, "back"));

  const phoneInput = form?.elements.namedItem("phone");
  phoneInput?.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) phoneInput.value = digits.replace(/^(\d{0,2})/, "($1");
    else if (digits.length <= 7) phoneInput.value = digits.replace(/^(\d{2})(\d+)/, "($1) $2");
    else phoneInput.value = digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    formStatus.textContent = "Abrindo o WhatsApp…";

    const values = Object.fromEntries(new FormData(form));
    const message = [
      "Olá! Acessei a página de Full Face do Instituto Rafael Dias e gostaria de falar com a equipe.",
      "",
      `Nome: ${values.name}`,
      `WhatsApp informado: ${values.phone}`,
      `E-mail: ${values.email}`,
      "",
      "Perfil para avaliação:",
      `Faixa etária: ${values.ageRange}`,
      `Autocuidado: ${values.selfCare}`,
      `Motivação: ${values.motivation}`,
      `Faixa de investimento: ${values.investment}`,
    ]
      .filter(Boolean)
      .join("\n");

    const destination = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    const newWindow = window.open(destination, "_blank", "noopener,noreferrer");
    if (!newWindow) window.location.href = destination;
    track("generate_lead", { form: "evaluation", destination: "whatsapp" });
    window.fbq?.("track", "Lead", { content_name: "Avaliação de full face" });
    track("lead_handoff_whatsapp", { form: "evaluation", step_count: steps.length });
    formStatus.textContent = "O WhatsApp foi aberto. Continue a conversa por lá.";
    form.removeAttribute("aria-busy");
    submitButton.disabled = false;
  });
})();
