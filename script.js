const cart = JSON.parse(localStorage.getItem('fitbalance-cart') || '{}');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotalItems = document.getElementById('cartTotalItems');
const template = document.getElementById('cartItemTemplate');
const paymentModal = document.getElementById('paymentModal');
const paymentTitle = document.getElementById('paymentTitle');
const paymentFields = document.getElementById('paymentFields');
const paymentForm = document.getElementById('paymentForm');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const closePaymentModalBtn = document.getElementById('closePaymentModal');
const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const clearChatBtn = document.getElementById('clearChatBtn');
const openChatBtn = document.getElementById('openChatBtn');
const companyLinks = document.querySelectorAll('.company-link');
const companyPanels = document.querySelectorAll('[data-company-panel]');
const companySelect = document.getElementById('companySelect');
const productTabs = document.querySelectorAll('.tab');
const productCards = document.querySelectorAll('.product-card');
const paymentCards = document.querySelectorAll('.payment-card');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const mainSections = document.querySelectorAll('[data-main-section]');
const sectionButtons = document.querySelectorAll('[data-section-target]');
const navLinks = document.querySelectorAll('.nav a[data-section-target]');

function formatCRC(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(amount);
}

function saveCart() {
  localStorage.setItem('fitbalance-cart', JSON.stringify(cart));
}

function getTotalItems() {
  return Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
}

function getSubtotal() {
  return Object.values(cart).reduce((acc, item) => acc + item.price * item.qty, 0);
}

function openOverlay() {
  overlay.classList.add('show');
}

function closeOverlayIfIdle() {
  if (!cartDrawer.classList.contains('open') && !paymentModal.classList.contains('show')) {
    overlay.classList.remove('show');
  }
}

function openCart() {
  cartDrawer.classList.add('open');
  openOverlay();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  closeOverlayIfIdle();
}

function buildPaymentFields(method) {
  if (method.includes('Tarjeta')) {
    return `
      <div class="field-grid">
        <div class="field"><label>Número de tarjeta</label><input type="text" placeholder="0000 0000 0000 0000" /></div>
        <div class="field"><label>Nombre del titular</label><input type="text" placeholder="Nombre completo" /></div>
        <div class="field"><label>Vencimiento</label><input type="text" placeholder="MM/AA" /></div>
        <div class="field"><label>CVV</label><input type="text" placeholder="123" /></div>
      </div>
      <p class="helper-text">Simulación académica: los datos ingresados no se almacenan ni procesan.</p>
    `;
  }

  if (method.includes('SINPE')) {
    return `
      <div class="field-grid">
        <div class="field full"><label>Número SINPE Móvil</label><input type="text" placeholder="8888-8888" /></div>
        <div class="field full"><label>Nombre del pagador</label><input type="text" placeholder="Nombre completo" /></div>
      </div>
      <p class="helper-text">Podés simular un pago rápido y continuar con tu compra.</p>
    `;
  }

  return `
    <div class="field-grid">
      <div class="field full"><label>Banco de origen</label><input type="text" placeholder="Ejemplo: BAC / BN / BCR" /></div>
      <div class="field full"><label>Número de comprobante</label><input type="text" placeholder="000000" /></div>
    </div>
    <p class="helper-text">La transferencia es ilustrativa y no genera cobros reales.</p>
  `;
}

function openPaymentModal(method = 'Pago simulado') {
  paymentTitle.textContent = method;
  paymentFields.innerHTML = buildPaymentFields(method);
  paymentModal.classList.add('show');
  openOverlay();
}

function closePaymentModal() {
  paymentModal.classList.remove('show');
  closeOverlayIfIdle();
}

function renderCart() {
  cartItems.innerHTML = '';
  const items = Object.values(cart);

  if (!items.length) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos al carrito.</p>';
  }

  items.forEach((item) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.cart-item-image').src = item.image;
    node.querySelector('.cart-item-image').alt = item.name;
    node.querySelector('.cart-item-name').textContent = item.name;
    node.querySelector('.cart-item-price').textContent = formatCRC(item.price);
    node.querySelector('.cart-item-qty').textContent = item.qty;

    node.querySelector('.qty-minus').addEventListener('click', () => updateQty(item.name, -1));
    node.querySelector('.qty-plus').addEventListener('click', () => updateQty(item.name, 1));
    node.querySelector('.remove-btn').addEventListener('click', () => removeItem(item.name));
    cartItems.appendChild(node);
  });

  cartCount.textContent = getTotalItems();
  cartSubtotal.textContent = formatCRC(getSubtotal());
  cartTotalItems.textContent = getTotalItems();
  saveCart();
}

function addItem(name, price, image) {
  if (!cart[name]) {
    cart[name] = { name, price: Number(price), image, qty: 0 };
  }
  cart[name].qty += 1;
  renderCart();
  openCart();
}

function updateQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  renderCart();
}

function removeItem(name) {
  delete cart[name];
  renderCart();
}

function activateMainSection(targetId, pushHash = true) {
  if (!targetId) return;

  mainSections.forEach((section) => {
    section.classList.toggle('active', section.id === targetId);
  });

  sectionButtons.forEach((button) => {
    const isActive = button.dataset.sectionTarget === targetId;
    button.classList.toggle('active', isActive);
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.sectionTarget === targetId);
  });

  if (pushHash) {
    history.replaceState(null, '', `#${targetId}`);
  }

  const topbar = document.querySelector('.topbar');
  const offset = topbar ? topbar.offsetHeight : 0;
  const firstSection = document.getElementById(targetId);
  if (firstSection) {
    const targetTop = firstSection.getBoundingClientRect().top + window.scrollY - offset - 8;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }
}

function activateCompanyPanel(targetId) {
  companyLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.companyTarget === targetId);
  });

  companyPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });

  if (companySelect) companySelect.value = targetId;
}

function addChatMessage(text, type = 'bot') {
  const div = document.createElement('div');
  div.className = type === 'user' ? 'user-message' : 'bot-message';
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function buildBotReply(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('env') || normalized.includes('entrega')) {
    return 'Realizamos envíos a nivel nacional en Costa Rica mediante mensajería y aliados logísticos.';
  }
  if (normalized.includes('pago') || normalized.includes('sinpe') || normalized.includes('tarjeta')) {
    return 'Podés simular el pago con tarjeta, SINPE Móvil o transferencia bancaria.';
  }
  if (normalized.includes('ropa') || normalized.includes('producto') || normalized.includes('mat') || normalized.includes('liga')) {
    return 'Tenemos ropa deportiva, accesorios fitness y snacks saludables para complementar tu rutina.';
  }
  if (normalized.includes('hola') || normalized.includes('buenas')) {
    return '¡Hola! Con gusto te ayudo. Podés consultarme sobre productos, pagos o envíos.';
  }
  return 'Gracias por tu mensaje. En esta simulación académica puedo orientarte sobre productos, pagos y envíos.';
}

sectionButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const targetId = button.dataset.sectionTarget;
    if (!targetId) return;

    event.preventDefault();
    activateMainSection(targetId);
  });
});

companyLinks.forEach((link) => {
  link.addEventListener('click', () => activateCompanyPanel(link.dataset.companyTarget));
});

if (companySelect) {
  companySelect.addEventListener('change', (event) => {
    activateCompanyPanel(event.target.value);
  });
}

productTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    productTabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;

    productCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? 'flex' : 'none';
    });
  });
});

addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addItem(button.dataset.name, button.dataset.price, button.dataset.image);
  });
});

paymentCards.forEach((card) => {
  card.addEventListener('click', () => {
    openPaymentModal(card.dataset.method);
  });
});

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
closePaymentModalBtn.addEventListener('click', closePaymentModal);

overlay.addEventListener('click', () => {
  closeCart();
  closePaymentModal();
});

checkoutBtn.addEventListener('click', () => {
  if (!getTotalItems()) {
    alert('Primero agregá al menos un producto al carrito.');
    return;
  }
  openPaymentModal('Pago simulado');
});

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Pago simulado confirmado correctamente.');
  closePaymentModal();
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  addChatMessage(value, 'user');
  chatInput.value = '';
  setTimeout(() => addChatMessage(buildBotReply(value), 'bot'), 300);
});

clearChatBtn.addEventListener('click', () => {
  chatWindow.innerHTML = '<div class="bot-message">¡Hola! Soy FitBot. ¿Te ayudo con productos, pagos o envíos?</div>';
});

if (openChatBtn) {
  openChatBtn.addEventListener('click', () => {
    activateMainSection('contacto');
    setTimeout(() => {
      chatInput?.focus();
    }, 250);
  });
}

const initialHash = window.location.hash.replace('#', '');
const validSectionIds = Array.from(mainSections).map((section) => section.id);
activateMainSection(validSectionIds.includes(initialHash) ? initialHash : 'empresa', false);
activateCompanyPanel('historia');
renderCart();
