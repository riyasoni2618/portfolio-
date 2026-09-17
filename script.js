let menuIcon = document.querySelector('#menu-icon');
let navbar= document.querySelector('.navbar');

menuIcon.onclick =()=>{
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec =>{
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top>= offset && top < offset + height){
            navLinks.forEach(links=>{
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
    let header = document.querySelector('header');
    header.classList.toggle('sticky' , window.scrollY>100);

    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};
ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});
ScrollReveal().reveal('.home-content , .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img , .services-container, .portfolio-box, .portfolio-card, .contact form' , {origin: 'bottom'});
ScrollReveal().reveal('.home-content  h1, .about-img', {origin: 'left'});
ScrollReveal().reveal('.home-content  p, .about-content', {origin: 'right'});
// typed js animation - Home Section
const typed = new Typed('.multiple-text', {
    strings: ['Full Stack Developer', 'Generative AI Engineer'],
    typeSpeed: 70,
    backSpeed: 45,
    backDelay: 1800,
    startDelay: 300,
    loop: true
});

// typed js animation - About Section
if (document.querySelector('.about-multiple-text')) {
    const aboutTyped = new Typed('.about-multiple-text', {
        strings: [
            'Full Stack Developer',
            'Generative AI Engineer',
            'Full Stack Developer | Generative AI Engineer'
        ],
        typeSpeed: 70,
        backSpeed: 45,
        backDelay: 2000,
        startDelay: 400,
        loop: true
    });
}

// Dynamic synchronization of all skill progress bars with percentage values
function syncSkillProgressBars() {
  document.querySelectorAll('.skill-card').forEach(card => {
    const percentEl = card.querySelector('.skill-percent');
    const fillEl = card.querySelector('.progress-fill');
    if (percentEl && fillEl) {
      const match = percentEl.textContent.trim().match(/(\d+)%/);
      if (match) {
        const percent = match[1] + '%';
        fillEl.style.setProperty('--value', percent);
      }
    }
  });
}
// Run on load
syncSkillProgressBars();

// Navbar links click closes mobile menu
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.navbar').classList.remove('active');
  });
});

// Contact Form - Secure API integration with UX loading/feedback states
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = document.getElementById('contactBtn') || form.querySelector('.contact-btn');
  const statusDiv = document.getElementById('formStatus');

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showStatus(type, message) {
    if (!statusDiv) return;
    statusDiv.className = `form-status ${type}`;
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'flex';
  }

  function clearStatus() {
    if (!statusDiv) return;
    statusDiv.className = 'form-status';
    statusDiv.innerHTML = '';
    statusDiv.style.display = 'none';
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearStatus();

    const name = form.name ? form.name.value.trim() : '';
    const email = form.email ? form.email.value.trim() : '';
    const phone = form.phone ? form.phone.value.trim() : '';
    const subject = form.subject ? form.subject.value : 'General';
    const message = form.message ? form.message.value.trim() : '';
    const _gotcha = form._gotcha ? form._gotcha.value : '';

    // Frontend validation
    if (!name) {
      showStatus('error', '<i class="fas fa-exclamation-circle"></i> Please enter your name.');
      if (form.name) form.name.focus();
      return;
    }

    if (!email || !isEmailValid(email)) {
      showStatus('error', '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.');
      if (form.email) form.email.focus();
      return;
    }

    if (!message || message.length < 2) {
      showStatus('error', '<i class="fas fa-exclamation-circle"></i> Please write your message (at least 2 characters).');
      if (form.message) form.message.focus();
      return;
    }

    // Set UI to loading state to prevent duplicate submissions
    const originalBtnContent = btn ? btn.innerHTML : 'Send message';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    showStatus('loading', '<i class="fas fa-spinner fa-spin"></i> Sending your message, please wait...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          _gotcha
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        showStatus('success', '<i class="fas fa-check-circle"></i> Thanks for reaching out! Your message has been sent successfully.');
        form.reset(); // Clear only on successful submission
      } else {
        const errorMsg = data.error || 'Something went wrong while sending your message. Please try again.';
        showStatus('error', `<i class="fas fa-exclamation-circle"></i> ${errorMsg}`);
        // Preserves form input on failure
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      showStatus('error', '<i class="fas fa-exclamation-circle"></i> Something went wrong while sending your message. Please try again.');
      // Preserves form input on failure
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnContent;
      }
    }
  });
})();
