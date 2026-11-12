"use strict";

const PROJECTS = {
  landing: { name: "Landing Page / Portfolio", price: 100000 },
  corporate: { name: "Corporate / Business Website", price: 200000 },
  ecommerce: { name: "E-Commerce Store", price: 350000 },
  webapp: { name: "Custom Web App / SaaS", price: 500000 }
};

const FEATURES = {
  design: { name: "UI/UX Design from Scratch", price: 60000 },
  payments: { name: "Payment Gateway Integration", price: 50000 },
  auth: { name: "User Authentication & Dashboards", price: 80000 },
  ai: { name: "AI / Automation Integration", price: 100000 },
};

const OPERATIONS = {
  assets: {
    title: "Brand Assets & Content",
    ready: { label: "I have logo, text & images ready", summary: "Assets ready", price: 0 },
    creation: { label: "I need content & brand asset creation", summary: "Content & brand assets", price: 40000 }
  },
  domain: {
    title: "Domain & Hosting",
    own: { label: "I already have / will buy my own", summary: "Using own domain/hosting", price: 0 },
    setup: { label: "Set up & register domain/hosting for me", summary: "Domain & hosting setup", price: 35000 }
  },
  support: {
    title: "Post-Launch Support",
    warranty: { label: "Standard 14-day bug-fix warranty", summary: "14-day bug-fix warranty", price: 0, included: true },
    priority: { label: "30-Day Priority Maintenance & Updates", summary: "30-day priority support", price: 30000 }
  }
};

const STEP_LABELS = ["Project type", "Features & add-ons", "Timeline & readiness", "Your details"];
const WHATSAPP_PHONE = "09051171814"; // Replace with your WhatsApp number, including country code
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const BLOCKED_EMAIL_ADDRESSES = new Set(["test@test.com", "example@example.com"]);

const state = {
  step: 1,
  project: null,
  features: new Set(),
  timeline: null,
  operations: {
    assets: "ready",
    domain: "own",
    support: "warranty"
  }
};

const formatNaira = (amount) => `₦${amount.toLocaleString("en-NG")}`;

function getEstimate() {
  const projectPrice = state.project ? PROJECTS[state.project].price : 0;
  const featuresPrice = [...state.features].reduce((sum, key) => sum + FEATURES[key].price, 0);
  const operationsPrice = Object.keys(OPERATIONS).reduce((sum, key) => {
    return sum + OPERATIONS[key][state.operations[key]].price;
  }, 0);
  const subtotal = projectPrice + featuresPrice + operationsPrice;
  const total = state.timeline === "express" ? Math.round(subtotal * 1.25) : subtotal;
  return { subtotal, total, high: Math.round(total * 1.2) };
}

function formatOperationCost(choice) {
  if (choice.included) return `${formatNaira(choice.price)} · Included`;
  return choice.price ? `+${formatNaira(choice.price)}` : formatNaira(0);
}

function getOperationDetails() {
  return Object.entries(OPERATIONS).map(([key, choices]) => {
    const choice = choices[state.operations[key]];
    return {
      key,
      category: choices.title,
      label: choice.label,
      detail: `${choice.label} (${formatOperationCost(choice)})`,
      summary: `${choice.summary} (${formatOperationCost(choice)})`,
      price: choice.price
    };
  });
}

function renderSummary() {
  const estimate = getEstimate();
  const low = document.getElementById("estimate-low");
  low.textContent = estimate.total.toLocaleString("en-NG");
  low.previousElementSibling.textContent = "₦";
  document.getElementById("estimate-high").textContent = formatNaira(estimate.high);
  document.getElementById("summary-total").textContent = formatNaira(estimate.total);
  document.getElementById("summary-project").textContent = state.project ? PROJECTS[state.project].name : "Not selected";
  document.getElementById("summary-features").textContent = state.features.size
    ? [...state.features].map((key) => FEATURES[key].name).join(", ")
    : "None selected";
  document.getElementById("summary-timeline").textContent = state.timeline
    ? state.timeline === "express" ? "Express (+25%)" : "Standard"
    : "Not selected";
  getOperationDetails().forEach(({ key, summary }) => {
    document.getElementById(`summary-${key}`).textContent = summary;
  });
}

function renderOptionPrices() {
  document.querySelectorAll(".project-option, .feature-option").forEach((button) => {
    const prefix = button.classList.contains("feature-option") ? "+" : "";
    button.querySelector(".option-price").textContent = `${prefix}${formatNaira(Number(button.dataset.price))}`;
  });
  document.querySelectorAll(".operation-radio").forEach((input) => {
    const choice = OPERATIONS[input.dataset.operation][input.dataset.choice];
    input.closest(".operation-option").querySelector(".option-price").textContent = formatOperationCost(choice);
  });
}

function updateStep() {
  document.querySelectorAll(".wizard-step").forEach((section) => {
    const active = Number(section.dataset.step) === state.step;
    section.hidden = !active;
    section.classList.toggle("is-active", active);
  });

  const percentage = (state.step / STEP_LABELS.length) * 100;
  document.getElementById("step-caption").textContent = `STEP ${state.step} OF ${STEP_LABELS.length}`;
  document.getElementById("progress-label").textContent = STEP_LABELS[state.step - 1];
  document.getElementById("progress-fill").style.width = `${percentage}%`;
  document.getElementById("progress-track").setAttribute("aria-valuenow", String(state.step));
  document.querySelectorAll(".step-dot").forEach((dot, index) => {
    dot.classList.toggle("is-current", index + 1 === state.step);
    dot.classList.toggle("is-complete", index + 1 < state.step);
  });
  document.getElementById("back-button").disabled = state.step === 1;
  document.getElementById("next-button").hidden = state.step === STEP_LABELS.length;
  document.getElementById("form-status").textContent = "";
  document.getElementById("form-status").className = "form-status";
}

function announce(message, type) {
  const status = document.getElementById("form-status");
  status.textContent = message;
  status.className = `form-status is-${type}`;
}

function getContactDetails() {
  const name = document.getElementById("client-name").value.trim();
  const projectName = document.getElementById("project-name").value.trim();
  const emailInput = document.getElementById("client-email");
  const email = emailInput.value.trim();
  const phoneInput = document.getElementById("client-phone");
  const phone = phoneInput.value.trim();
  if (!name || !projectName || !email || !phone) {
    announce("Please complete all four fields before continuing.", "error");
    return null;
  }
  if (!emailInput.checkValidity()) {
    announce("Enter a valid email address.", "error");
    return null;
  }
  if (!phoneInput.checkValidity()) {
    announce("Enter a valid phone number, including your country code if needed.", "error");
    return null;
  }
  return { name, projectName, email, phone };
}

function isBlockedContactEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@").pop();
  return BLOCKED_EMAIL_ADDRESSES.has(normalizedEmail)
    || domain === "mailinator.com"
    || domain.endsWith(".mailinator.com");
}

function getQuoteText(contact) {
  const estimate = getEstimate();
  const selectedFeatures = [...state.features].map((key) =>
    `   - ${FEATURES[key].name}: *${formatNaira(FEATURES[key].price)}*`
  );
  const project = PROJECTS[state.project];
  const timeline = state.timeline === "express" ? "Express Delivery" : "Standard Delivery";
  const timelineCost = state.timeline === "express" ? "+25%" : formatNaira(0);
  const operationLines = getOperationDetails().map(({ category, label, key }) => {
    const choice = OPERATIONS[key][state.operations[key]];
    return `   - ${category}: ${label} (*${formatOperationCost(choice)}*)`;
  });
  return [
    "Hello! I'd like to discuss this website project estimate.",
    "",
    "*Client Details:*",
    `*Client:* ${contact.name}`,
    `*Project / Business:* ${contact.projectName}`,
    `*Email:* ${contact.email}`,
    `*Phone:* ${contact.phone}`,
    "",
    "*Project Scope Breakdown:*",
    `1. *Project Type:* ${project.name} — *${formatNaira(project.price)}*`,
    "2. *Features:*",
    ...(selectedFeatures.length ? selectedFeatures : ["   - None selected — *₦0*"]),
    `3. *Timeline:* ${timeline} — *${timelineCost}*`,
    "4. *Operations & Readiness:*",
    ...operationLines,
    "",
    "*Final Note:*",
    `*Estimated Range:* *${formatNaira(estimate.total)}* to *${formatNaira(estimate.high)}* (Negotiable)`,
    "",
    "_This is an automated estimate based on your selected features (Negotiable). Final pricing will be confirmed after a brief scope review._"
  ].join("\n");
}

function getEmailQuoteText(contact) {
  const estimate = getEstimate();
  const selectedFeatures = [...state.features].map((key) =>
    `   - ${FEATURES[key].name}: ${formatNaira(FEATURES[key].price)}`
  );
  const project = PROJECTS[state.project];
  const timeline = state.timeline === "express" ? "Express Delivery" : "Standard Delivery";
  const timelineCost = state.timeline === "express" ? "+25%" : formatNaira(0);
  const operationLines = getOperationDetails().map(({ category, label, key }) => {
    const choice = OPERATIONS[key][state.operations[key]];
    return `   - ${category}: ${label} (${formatOperationCost(choice)})`;
  });
  return [
    "Hello! I'd like to discuss this website project estimate.",
    "",
    "CLIENT DETAILS",
    "--------------",
    `Client: ${contact.name}`,
    `Project / Business: ${contact.projectName}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    "",
    "PROJECT SCOPE BREAKDOWN",
    "-----------------------",
    `1. Project Type: ${project.name} — ${formatNaira(project.price)}`,
    "2. Features:",
    ...(selectedFeatures.length ? selectedFeatures : [`   - None selected — ${formatNaira(0)}`]),
    `3. Timeline: ${timeline} — ${timelineCost}`,
    "4. Operations & Readiness:",
    ...operationLines,
    "",
    "FINAL NOTE",
    "----------",
    `Estimated Range: ${formatNaira(estimate.total)} to ${formatNaira(estimate.high)} (Negotiable)`,
    "",
    "This is an automated estimate based on your selected features (Negotiable). Final pricing will be confirmed after a brief scope review."
  ].join("\n");
}

function validateEstimate() {
  if (!state.project) {
    announce("Choose a project type to continue.", "error");
    return false;
  }
  if (!state.timeline) {
    announce("Choose a delivery timeline to continue.", "error");
    return false;
  }
  return true;
}

document.querySelectorAll(".project-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.project = button.dataset.project;
    document.querySelectorAll(".project-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    renderSummary();
  });
});

document.querySelectorAll(".feature-option").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.feature;
    const selected = !state.features.has(key);
    if (selected) state.features.add(key);
    else state.features.delete(key);
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    renderSummary();
  });
});

document.querySelectorAll(".timeline-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.timeline = button.dataset.timeline;
    document.querySelectorAll(".timeline-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    renderSummary();
  });
});

document.querySelectorAll(".operation-radio").forEach((input) => {
  input.addEventListener("change", () => {
    const operation = input.dataset.operation;
    state.operations[operation] = input.dataset.choice;
    document.querySelectorAll(`.operation-radio[data-operation="${operation}"]`).forEach((radio) => {
      radio.closest(".operation-option").classList.toggle("is-selected", radio.checked);
    });
    renderSummary();
  });
});

document.getElementById("next-button").addEventListener("click", () => {
  if (state.step === 1 && !state.project) {
    announce("Choose a project type to continue.", "error");
    return;
  }
  if (state.step === 3 && !state.timeline) {
    announce("Choose a delivery timeline to continue.", "error");
    return;
  }
  state.step = Math.min(state.step + 1, STEP_LABELS.length);
  updateStep();
});

document.getElementById("back-button").addEventListener("click", () => {
  state.step = Math.max(state.step - 1, 1);
  updateStep();
});

document.getElementById("whatsapp-button").addEventListener("click", () => {
  if (!validateEstimate()) return;
  const contact = getContactDetails();
  if (!contact) return;
  const whatsappPhone = WHATSAPP_PHONE.replace(/\D/g, "").replace(/^0/, "234");
  if (!/^\d{7,15}$/.test(whatsappPhone)) {
    announce("Set WHATSAPP_PHONE in script.js to an international number or a Nigerian local number, then try again.", "error");
    return;
  }
  const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(getQuoteText(contact))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("estimate-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateEstimate()) return;
  const contact = getContactDetails();
  if (!contact) return;
  if (isBlockedContactEmail(contact.email)) {
    announce("Please enter a valid contact email address, not a temporary or example email.", "error");
    return;
  }
  const form = document.getElementById("estimate-form");
  const accessKey = form.elements.access_key.value.trim();
  if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
    announce("Add your Web3Forms access key to the hidden access_key field in index.html before sending.", "error");
    return;
  }

  const button = document.getElementById("email-button");
  button.disabled = true;
  button.textContent = "Sending inquiry…";
  const estimate = getEstimate();
  const project = PROJECTS[state.project];
  const selectedAddOns = [...state.features].map((key) =>
    `${FEATURES[key].name} — ${formatNaira(FEATURES[key].price)}`
  );
  const timeline = state.timeline === "express" ? "Express Delivery (+25%)" : "Standard Delivery";
  const estimatedRange = `${formatNaira(estimate.total)} to ${formatNaira(estimate.high)}`;
  const operationDetails = getOperationDetails();
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.name = contact.name;
  payload.email = contact.email;
  payload.phone = contact.phone;
  payload.business_name = contact.projectName;
  payload.subject = `Website project estimate — ${contact.projectName}`;
  payload.from_name = "Website Project Estimator";
  payload.project_type = project.name;
  payload.selected_add_ons = selectedAddOns.length ? selectedAddOns.join(", ") : "None selected";
  payload.timeline = timeline;
  payload.brand_assets_and_content = operationDetails.find(({ key }) => key === "assets").detail;
  payload.domain_and_hosting = operationDetails.find(({ key }) => key === "domain").detail;
  payload.post_launch_support = operationDetails.find(({ key }) => key === "support").detail;
  payload.estimated_range = estimatedRange;
  payload.message = getEmailQuoteText(contact);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Form submission failed (${response.status}).`);
    }
    announce("Your inquiry was sent successfully. We’ll be in touch soon.", "success");
    form.reset();
    document.querySelectorAll(".operation-radio").forEach((radio) => {
      radio.checked = radio.dataset.choice === state.operations[radio.dataset.operation];
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    announce(`${message} Please try again or send your quote via WhatsApp.`, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = 'Submit inquiry via Email <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
});

document.getElementById("current-year").textContent = String(new Date().getFullYear());
renderOptionPrices();
renderSummary();
updateStep();
