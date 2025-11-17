const menuItems = [
  { id: 1, name: 'Paneer Tikka', price: 250 },
  { id: 2, name: 'Veg Biryani', price: 200 },
  { id: 3, name: 'Butter Naan', price: 50 },
];

const menuContainer = document.getElementById('menu-items');
const cartContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const authMsg = document.getElementById('auth-msg');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderMenu() {
  menuContainer.innerHTML = menuItems.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const item = menuItems.find(i => i.id === id);
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  cartContainer.innerHTML = cart.map(item => `<p>${item.name} — ₹${item.price}</p>`).join('');
  cartCount.textContent = cart.length;
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showSection(link.getAttribute('href').substring(1));
  });
});

document.getElementById('auth-form').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  authMsg.textContent = data.message;
});

document.getElementById('checkout-btn').addEventListener('click', async () => {
  const res = await fetch('http://localhost:5000/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart })
  });
  const data = await res.json();
  alert(data.message);
  cart = [];
  localStorage.removeItem('cart');
  updateCart();
});

renderMenu();
updateCart();
