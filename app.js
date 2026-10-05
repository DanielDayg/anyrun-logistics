// Fill these in from Supabase: Project Settings -> API -> Project URL / anon public key.
// The anon key is meant to be public in front-end code; access is controlled by the
// Row Level Security policy on the quote_requests table (see supabase_setup.sql).
var SUPABASE_URL = "https://husfnbzhgudmrrmhjqqc.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_JsyLHn2vc3AMCGFjAq_xKw_B4-IcVDv";

document.getElementById('year').textContent = new Date().getFullYear();

var menuBtn = document.getElementById('menuBtn');
var navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });
}

var d = new Date();
var stamp = 'AR-' + d.getFullYear().toString().slice(2) + (d.getMonth() + 1).toString().padStart(2, '0') +
  d.getDate().toString().padStart(2, '0') + '-' + Math.floor(100 + Math.random() * 900);
var ticketEl = document.getElementById('ticketNum');
if (ticketEl) ticketEl.textContent = stamp;

// Power quote: category group + pill picker
var pqGroups = document.querySelectorAll('.pq-group');
var pqPanels = document.querySelectorAll('.pq-subpanel');
var pqPills = document.querySelectorAll('.pq-pill');
var categoryInput = document.getElementById('categoryInput');
var pqSelectedLabel = document.getElementById('pqSelectedLabel');

pqGroups.forEach(function (btn) {
  btn.addEventListener('click', function () {
    var g = btn.getAttribute('data-group');
    pqGroups.forEach(function (b) { b.classList.toggle('active', b === btn); });
    pqPanels.forEach(function (p) { p.hidden = p.getAttribute('data-group-panel') !== g; });
  });
});

pqPills.forEach(function (pill) {
  pill.addEventListener('click', function () {
    pqPills.forEach(function (p) { p.classList.remove('active'); });
    pill.classList.add('active');
    var val = pill.getAttribute('data-value');
    if (categoryInput) categoryInput.value = val;
    if (pqSelectedLabel) pqSelectedLabel.textContent = 'Selected: ' + val;
  });
});

var quoteForm = document.querySelector('form.quote-form');
if (quoteForm) {
  quoteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var statusEl = quoteForm.querySelector('.form-status');
    var submitBtn = quoteForm.querySelector('button[type="submit"]');

    var isPickupCity = quoteForm.pickupCity !== undefined;
    var pickupVal = isPickupCity
      ? [quoteForm.pickupCity.value, quoteForm.pickupState.value].filter(Boolean).join(', ')
      : quoteForm.pickup.value;
    var dropoffVal = isPickupCity
      ? [quoteForm.dropoffCity.value, quoteForm.dropoffState.value].filter(Boolean).join(', ')
      : quoteForm.dropoff.value;

    var payload = {
      category: quoteForm.category.value,
      pickup: pickupVal,
      dropoff: dropoffVal,
      timing: quoteForm.timing.value,
      details: quoteForm.details.value,
      name: quoteForm.name.value,
      email: quoteForm.email.value,
      phone: quoteForm.phone.value || null,
      budget: quoteForm.budget ? (quoteForm.budget.value || null) : null,
      source_page: window.location.pathname.split('/').pop() || 'index.html'
    };

    if (!payload.category) {
      if (statusEl) { statusEl.textContent = 'Please choose what\'s moving before submitting.'; statusEl.className = 'form-status err'; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }

    fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        quoteForm.reset();
        if (statusEl) {
          statusEl.textContent = 'Manifest received. We’ll follow up by email within one business day.';
          statusEl.className = 'form-status ok';
        }
        submitBtn.textContent = 'Submitted';
      })
      .catch(function () {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong submitting this. Please email anyrunlogistics@gmail.com directly for now.';
          statusEl.className = 'form-status err';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Manifest';
      });
  });
}
