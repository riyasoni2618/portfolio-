let menuIcon = document.querySelector('#menu-icon');
let navbar= document.querySelector('.navbar');

menuIcon.onclick =()=>{
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.foreach(sec =>{
        let top = windows.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetheight;
        let id = sec.getAttribute('id');

        if(top>= offset && top < offset + height){
            navLinks.foreach(links=>{
                links.classList.remove('aactive');
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
ScrollReveal().reveal('.home-img , .services-container, .portfolio-box, .contact form' , {origin: 'botton'});
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
