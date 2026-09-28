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

var quoteForm = document.querySelector('form.quote-form');
if (quoteForm) {
  quoteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var statusEl = quoteForm.querySelector('.form-status');
    var submitBtn = quoteForm.querySelector('button[type="submit"]');

    var payload = {
      category: quoteForm.category.value,
      pickup: quoteForm.pickup.value,
      dropoff: quoteForm.dropoff.value,
      timing: quoteForm.timing.value,
      details: quoteForm.details.value,
      name: quoteForm.name.value,
      email: quoteForm.email.value,
      phone: quoteForm.phone.value || null,
      source_page: window.location.pathname.split('/').pop() || 'index.html'
    };

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
