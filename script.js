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
ScrollReveal().reveal('.home-img , .services-container, .portfolio-box, .contact form' , {origin: 'bottom'});
ScrollReveal().reveal('.home-content  h1, .about-img', {origin: 'left'});
ScrollReveal().reveal('.home-content  p, .about-content', {origin: 'right'});
// typed js animation

const typed = new Typed('.multiple-text',{
    strings: ['Full Stack Developer'],
    typeSpeed:100,
    backSpeed:100,
    backDelay:100,
    loop:true
})

// 
// document.querySelectorAll('.skill-card').forEach(card => {
//     card.addEventListener('click', () => {
//         alert(You clicked on: ${card.querySelector('h3').innerText});
//     });
// });
// Navbar links pe click hote hi menu close ho
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.navbar').classList.remove('active');
  });
});

// Simple front-end validation + friendly feedback
(function(){
  const form = document.getElementById('contactForm');

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if(!name) {
      alert('Please enter your name.');
      form.name.focus();
      return;
    }
    if(!email || !isEmailValid(email)) {
      alert('Please enter a valid email address.');
      form.email.focus();
      return;
    }
    if(!message) {
      alert('Please write a message.');
      form.message.focus();
      return;
    }

    // fake sending (replace with real API call if needed)
    const btn = document.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    setTimeout(() => {
      alert('Message sent — thank you! I will get back to you soon.');
      form.reset();
      btn.disabled = false;
      btn.textContent = 'Send message';
    }, 900);
  });
})();
