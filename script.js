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

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const item = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      image: button.dataset.image
    };
    addToCart(item);
    openCart();
  });
});

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (getTotalItems() === 0) {
    alert('Tu carrito está vacío. Agrega al menos un producto.');
    return;
  }
  openPaymentModal('card');
});

overlay.addEventListener('click', () => {
  closeCart();
  closePaymentModal();
});

document.querySelectorAll('.payment-card').forEach(card => {
  card.addEventListener('click', () => openPaymentModal(card.dataset.payment));
});

document.getElementById('closePaymentModal').addEventListener('click', closePaymentModal);

function formatCRC(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0
  }).format(amount);
}

function addToCart(item) {
  if (cart[item.id]) {
    cart[item.id].qty += 1;
  } else {
    cart[item.id] = { ...item, qty: 1 };
  }
  saveCart();
  renderCart();
}

function updateQty(id, change) {
  if (!cart[id]) return;
  cart[id].qty += change;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function getTotalItems() {
  return Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
}

function getSubtotal() {
  return Object.values(cart).reduce((acc, item) => acc + item.price * item.qty, 0);
}

function saveCart() {
  localStorage.setItem('fitbalance-cart', JSON.stringify(cart));
}

function renderCart() {
  cartItems.innerHTML = '';

  const items = Object.values(cart);
  if (!items.length) {
    cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío.<br>Agrega productos para continuar.</div>';
  } else {
    items.forEach(item => {
      const node = template.content.cloneNode(true);
      node.querySelector('.cart-item-image').src = item.image;
      node.querySelector('.cart-item-image').alt = item.name;
      node.querySelector('.cart-item-name').textContent = item.name;
      node.querySelector('.cart-item-price').textContent = formatCRC(item.price);
      node.querySelector('.cart-item-qty').textContent = item.qty;

      node.querySelector('.increase').addEventListener('click', () => updateQty(item.id, 1));
      node.querySelector('.decrease').addEventListener('click', () => updateQty(item.id, -1));
      node.querySelector('.remove-btn').addEventListener('click', () => removeItem(item.id));

      cartItems.appendChild(node);
    });
  }

  cartCount.textContent = getTotalItems();
  cartTotalItems.textContent = getTotalItems();
  cartSubtotal.textContent = formatCRC(getSubtotal());
}

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  if (!paymentModal.classList.contains('show')) {
    overlay.classList.remove('show');
  }
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function openPaymentModal(type) {
  paymentModal.classList.add('show');
  overlay.classList.add('show');
  paymentModal.setAttribute('aria-hidden', 'false');

  const total = formatCRC(getSubtotal());
  const totalItems = getTotalItems();

  const forms = {
    card: {
      title: 'Pago con tarjeta',
      html: `
        <div class="field">
          <label>Nombre del titular</label>
          <input type="text" placeholder="Ej. Rafael López" required>
        </div>
        <div class="field">
          <label>Número de tarjeta</label>
          <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" required>
        </div>
        <div class="field-grid">
          <div class="field">
            <label>Vencimiento</label>
            <input type="text" placeholder="MM/AA" maxlength="5" required>
          </div>
          <div class="field">
            <label>CVV</label>
            <input type="password" placeholder="123" maxlength="4" required>
          </div>
        </div>
        <div class="field">
          <label>Correo electrónico</label>
          <input type="email" placeholder="cliente@ejemplo.com" required>
        </div>
        <p class="helper-text">Resumen: ${totalItems} artículo(s) | Total: ${total}</p>
      `
    },
    sinpe: {
      title: 'Pago por SINPE Móvil',
      html: `
        <div class="field">
          <label>Nombre completo</label>
          <input type="text" placeholder="Ej. Rafael López" required>
        </div>
        <div class="field-grid">
          <div class="field">
            <label>Número SINPE</label>
            <input type="text" placeholder="8888-8888" maxlength="9" required>
          </div>
          <div class="field">
            <label>Monto</label>
            <input type="text" value="${total}" readonly>
          </div>
        </div>
        <div class="field">
          <label>Detalle</label>
          <textarea rows="3" placeholder="Pago de pedido FitBalance Store"></textarea>
        </div>
        <p class="helper-text">Simulación: confirmación de pago móvil para ${totalItems} artículo(s).</p>
      `
    },
    transfer: {
      title: 'Transferencia bancaria',
      html: `
        <div class="field">
          <label>Nombre del cliente</label>
          <input type="text" placeholder="Ej. Rafael López" required>
        </div>
        <div class="field-grid">
          <div class="field">
            <label>Banco</label>
            <select required>
              <option value="">Selecciona un banco</option>
              <option>BAC</option>
              <option>Banco Nacional</option>
              <option>Banco de Costa Rica</option>
              <option>Davivienda</option>
            </select>
          </div>
          <div class="field">
            <label>Monto a transferir</label>
            <input type="text" value="${total}" readonly>
          </div>
        </div>
        <div class="field full">
          <label>Cuenta destino</label>
          <input type="text" value="CR00 0000 0000 0000 0000 0000" readonly>
        </div>
        <div class="field">
          <label>Comprobante ilustrativo</label>
          <input type="text" placeholder="Ej. TRX-2026-00125" required>
        </div>
        <p class="helper-text">Simulación académica de transferencia para ${totalItems} artículo(s).</p>
      `
    }
  };

  const selected = forms[type];
  paymentTitle.textContent = selected.title;
  paymentFields.innerHTML = selected.html;
  paymentForm.dataset.method = type;
}

function closePaymentModal() {
  paymentModal.classList.remove('show');
  paymentModal.setAttribute('aria-hidden', 'true');
  if (!cartDrawer.classList.contains('open')) {
    overlay.classList.remove('show');
  }
}

paymentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const method = paymentForm.dataset.method || 'card';
  alert(`Pago simulado confirmado con el método: ${method === 'card' ? 'Tarjeta' : method === 'sinpe' ? 'SINPE Móvil' : 'Transferencia bancaria'}.`);
  closePaymentModal();
});

const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const openChatBtn = document.getElementById('openChatBtn');

openChatBtn.addEventListener('click', () => {
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => chatInput.focus(), 450);
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  chatInput.value = '';

  setTimeout(() => {
    appendMessage(getBotReply(message), 'bot');
  }, 500);
});

function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.className = sender === 'user' ? 'user-message' : 'bot-message';
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes('env') || text.includes('entrega')) {
    return 'Gracias por tu consulta 🙌 Un asesor de FitBalance Store se pondrá en contacto contigo en los próximos minutos para brindarte información detallada sobre nuestros envíos a nivel nacional.';
  }

  if (text.includes('pago') || text.includes('tarjeta') || text.includes('sinpe') || text.includes('transferencia')) {
    return 'Perfecto 💳 Hemos recibido tu consulta sobre métodos de pago. En breve, uno de nuestros asesores te brindará asistencia personalizada para completar tu compra de forma segura.';
  }

  if (text.includes('precio') || text.includes('cuesta') || text.includes('valor')) {
    return 'Gracias por tu interés 💚 Un asesor se pondrá en contacto contigo en los próximos minutos para brindarte información actualizada sobre precios y promociones disponibles.';
  }

  if (text.includes('producto') || text.includes('leggings') || text.includes('ligas') || text.includes('mat') || text.includes('barra')) {
    return 'Excelente elección 👌 Hemos recibido tu consulta sobre nuestros productos. En breve, un asesor te brindará recomendaciones personalizadas según tus necesidades.';
  }

  if (text.includes('hola') || text.includes('buenas')) {
    return '¡Hola! 👋 Gracias por escribir a FitBalance Store. Hemos recibido tu mensaje y uno de nuestros asesores se pondrá en contacto contigo en breve para ayudarte.';
  }

  return 'Gracias por tu mensaje 🙌 Hemos recibido tu solicitud correctamente. En los próximos minutos, un asesor de FitBalance Store se pondrá en contacto contigo para brindarte atención personalizada.';
}
  const text = message.toLowerCase();

  if (text.includes('env') || text.includes('entrega')) {
    return 'Realizamos envíos a toda Costa Rica mediante mensajería. El tiempo estimado ilustrativo es de 1 a 3 días hábiles.';
  }
  if (text.includes('pago') || text.includes('tarjeta') || text.includes('sinpe') || text.includes('transferencia')) {
    return 'Puedes simular pago por tarjeta, SINPE Móvil o transferencia bancaria. Todos son métodos demostrativos con fines académicos.';
  }
  if (text.includes('precio') || text.includes('cuesta') || text.includes('valor')) {
    return 'Los precios visibles en la tienda son ilustrativos y forman parte de la demostración del proyecto de comercio electrónico.';
  }
  if (text.includes('producto') || text.includes('leggings') || text.includes('ligas') || text.includes('mat') || text.includes('barra')) {
    return 'Actualmente la tienda muestra leggings deportivos, ligas de resistencia, mat de ejercicio y barra de proteína como catálogo principal.';
  }
  if (text.includes('hola') || text.includes('buenas')) {
    return '¡Hola! Con gusto te ayudo. Puedes consultarme sobre productos, pagos, envíos o contacto.';
  }

  return 'Gracias por tu mensaje. Esta es una simulación de atención al cliente para FitBalance Store. También puedes revisar productos, carrito y métodos de pago interactivos.';
}

renderCart();
