const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const cartCount = document.getElementById('cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const toast = document.getElementById('toast');
const year = document.getElementById('year');
let cartItems = 0;
let toastTimer;

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cartItems += 1;
    cartCount.textContent = cartItems;
    const product = button.dataset.product || 'Producto';
    showToast(`${product} agregado al carrito demostrativo.`);
  });
});

document.querySelector('.cart-button')?.addEventListener('click', () => {
  showToast('Carrito demostrativo: no se procesan compras reales en este proyecto académico.');
});
