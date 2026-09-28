document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Áreas de práctica accordion
document.querySelectorAll('.area-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.area-card');
    const isOpen = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
});

// Formulario de contacto: abre el cliente de correo con el mensaje redactado
const CONTACT_EMAIL = 'estudiointegralgarciasosa@gmail.com';
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = contactForm.nombre.value.trim();
    const telefono = contactForm.telefono.value.trim();
    const mensaje = contactForm.mensaje.value.trim();
    const subject = encodeURIComponent(`Consulta de ${nombre}`);
    const body = encodeURIComponent(`Nombre: ${nombre}\nTeléfono: ${telefono}\n\n${mensaje}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  });
}
