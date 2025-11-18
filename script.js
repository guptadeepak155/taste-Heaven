/* Common frontend logic for MPA pages:
   - product fetching from backend
   - cart management in localStorage
   - auth UI toggle & API calls
   - cart page rendering and checkout
*/

const API_BASE = 'http://localhost:5000/api';

// ---------- CART helpers ----------
function getCart() {
  try { return JSON.parse(localStorage.getItem('restaurant_cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem('restaurant_cart', JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (el) el.textContent = getCart().length;
}

// Add product (by product object) to cart
function addToCart(product) {
  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  const btn = document.querySelector('a[href="cart.html"], .btn.primary');
  // visual feedback
  alert(`${product.name} added to cart`);
}

// ---------- PRODUCTS (Index) ----------
async function fetchAndRenderProducts() {
  // Try to fetch from backend; if backend offline, show fallback list
  let products = [];
  try {
    const res = await fetch(API_BASE + '/products');
    if (res.ok) products = await res.json();
  } catch (e) {
    console.warn('Products fetch failed, using local fallback', e);
  }

  // fallback if empty
  if (!products || !products.length) {
    // NOTE: these IDs and image paths match the images you provided earlier
    products = [
      // 🥗 Starters
      { id: 1, name: "Paneer Tikka", price: 180, category: "Starters", img: "Paneertikka.jpg" },
      { id: 2, name: "Crispy Corn", price: 150, category: "Starters", img: "Crispy Corn.jpg" },
      { id: 3, name: "Veg Manchurian", price: 160, category: "Starters", img: "Veg Manchurian.jpg" },
      { id: 4, name: "Chicken Lollipop", price: 220, category: "Starters", img: "Chicken Lollipop.jpg" },

      // 🍛 Main Course
      { id: 5, name: "Butter Chicken", price: 280, category: "Main Course", img: "Butter Chicken.jpg" },
      { id: 6, name: "Paneer Butter Masala", price: 240, category: "Main Course", img: "Butter Paneer Masala.png" },
      { id: 7, name: "Dal Tadka", price: 160, category: "Main Course", img: "Dal Tadka.jpg" },
      { id: 8, name: "Veg Biryani", price: 200, category: "Main Course", img: "vegbiryani.png" },
      { id: 9, name: "Chicken Biryani", price: 250, category: "Main Course", img: "Chicken Biryani.jpg" },

      // 🍞 Breads
      { id: 10, name: "Butter Naan", price: 40, category: "Breads", img: "Butter Naan.jpg" },
      { id: 11, name: "Garlic Naan", price: 50, category: "Breads", img: "Cheese Garlic Bread.png" },
      { id: 12, name: "Tandoori Roti", price: 25, category: "Breads", img: "Tandoori Roti.jpg" },

      // 🍹 Drinks
      { id: 13, name: "Sweet Lassi", price: 90, category: "Drinks", img: "Sweet Lassi.jpg" },
      { id: 14, name: "Cold Coffee", price: 110, category: "Drinks", img: "cold-drink-7074305_1280.jpg" },
      { id: 15, name: "Mango Shake", price: 120, category: "Drinks", img: "mangoshake.jpg" },
      { id: 16, name: "Fresh Lime Soda", price: 80, category: "Drinks", img: "FreshLime Soda.jpg" },

      // 🍰 Desserts
      { id: 17, name: "Gulab Jamun", price: 100, category: "Desserts", img: "Gulab Jamun.jpg" },
      { id: 18, name: "Rasgulla", price: 100, category: "Desserts", img: "Rasgulla.jpg" },
      { id: 19, name: "Brownie with Ice Cream", price: 160, category: "Desserts", img: "Chocolate Brownie.jpg" },
      { id: 20, name: "Chocolate Mousse", price: 150, category: "Desserts", img: "Chocolate Mousse.jpg" }
    ];
  }

  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = products.map(p => {
    // prefer backend id if present
    const pid = p._id || p.id || p.name;
    return `
      <div class="product-card">
        <img class="product-image" src="${p.img}" alt="${escapeHtml(p.name)}" onerror="this.src='placeholder.png'"/>
        <div>
          <div class="product-name">${escapeHtml(p.name)}</div>
          <div class="product-price">₹${p.price}</div>
        </div>
        <div style="margin-top:auto;display:flex;justify-content:flex-end;">
          <button class="btn primary" onclick='addToCart(${JSON.stringify({ _id: pid, name: p.name, price: p.price, img: p.img })})'>Add</button>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- AUTH UI (login.html) ----------
function bindAuthUI() {
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  if (showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); loginPanel.classList.remove('active'); signupPanel.classList.add('active'); });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); signupPanel.classList.remove('active'); loginPanel.classList.add('active'); });

  if (loginBtn) loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');
    if (!email || !password) { msg.textContent = 'Please enter email and password.'; return; }
    try {
      const res = await fetch(API_BASE + '/auth/login', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('restaurant_user', JSON.stringify(data.user));
        msg.style.color = 'green';
        msg.textContent = 'Login successful — redirecting...';
        setTimeout(() => location.href = 'index.html', 900);
      } else {
        msg.style.color = '#d32f2f';
        msg.textContent = data.message || 'Login failed';
      }
    } catch (e) {
      msg.style.color = '#d32f2f';
      msg.textContent = 'Server error';
      console.error(e);
    }
  });

  if (signupBtn) signupBtn.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const msg = document.getElementById('signupMessage');
    if (!name || !email || !password) { msg.textContent = 'Please fill all fields'; return; }
    try {
      const res = await fetch(API_BASE + '/auth/signup', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        msg.style.color = 'green';
        msg.textContent = 'Signup successful — you can login now';
        setTimeout(() => { document.getElementById('showLogin').click(); }, 900);
      } else {
        msg.style.color = '#d32f2f';
        msg.textContent = data.message || 'Signup failed';
      }
    } catch (e) {
      msg.style.color = '#d32f2f';
      msg.textContent = 'Server error';
      console.error(e);
    }
  });
}
// ---------- ORDERS (Order history) ----------
async function fetchOrdersForUser(email) {
  try {
    const res = await fetch(API_BASE + '/orders/' + encodeURIComponent(email));
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch (e) {
    console.warn('Fetch orders fail', e);
    return [];
  }
}

async function renderOrdersPage() {
  const ordersWrap = document.getElementById('ordersWrap');
  if (!ordersWrap) return;
  const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
  if (!user) {
    ordersWrap.innerHTML = '<p class="muted">Please login to see your order history. <a href="login.html">Login</a></p>';
    return;
  }

  ordersWrap.innerHTML = '<p class="muted">Loading orders...</p>';
  const orders = await fetchOrdersForUser(user.email);
  if (!orders.length) {
    ordersWrap.innerHTML = '<p class="muted">No orders yet.</p>';
    return;
  }

  ordersWrap.innerHTML = orders.map((ord, idx) => {
    const list = (ord.items || []).map(i => `${escapeHtml(i.name)} (₹${i.price}${i.qty ? ' x'+i.qty : ''})`).join(', ');
    const total = ord.total || (ord.items ? ord.items.reduce((s,i)=> s + (i.price*(i.qty||1)),0) : 0);
    const date = ord.date ? (new Date(ord.date)).toLocaleString() : '';
    return `
      <div class="order-item" style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px;background:#fff;border-radius:10px;margin-bottom:10px;box-shadow:0 6px 18px rgba(0,0,0,0.04)  ">
        <div>
          <div style="font-weight:800; font-size: larger;">Order #${orders.length - idx}</div>
          <div style="font-size:13px;color:#555;margin-top:6px; font-size: medium;">${list}</div>
        </div>
        <div style="text-align:right ;font-size: larger;" >
          <div style="font-weight:800">₹${total}</div>
          <div style="font-size:12px;color:#777; font-size: small;" >${date}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- CONTACT form binding ----------
function bindContactForm() {
  const submitBtn = document.getElementById('contactSubmit');
  const clearBtn = document.getElementById('contactClear');
  const feedback = document.getElementById('contactFeedback');
  if (!submitBtn) return;
  submitBtn.addEventListener('click', async () => {
    const name = (document.getElementById('contactName')||{value:''}).value.trim();
    const email = (document.getElementById('contactEmail')||{value:''}).value.trim();
    const message = (document.getElementById('contactMessage')||{value:''}).value.trim();

    if (!name || !email || !message) { feedback.style.color = '#d32f2f'; feedback.textContent = 'Please fill all fields'; return; }
    feedback.style.color = '#333'; feedback.textContent = 'Sending...';

    try {
      const res = await fetch(API_BASE + '/contact', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        feedback.style.color = 'green';
        feedback.textContent = data.message || 'Enquiry sent';
        // clear fields
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
      } else {
        feedback.style.color = '#d32f2f';
        feedback.textContent = data.message || 'Failed to send enquiry';
      }
    } catch (err) {
      console.error(err);
      feedback.style.color = '#d32f2f';
      feedback.textContent = 'Server error';
    }
  });

  if (clearBtn) clearBtn.addEventListener('click', () => {
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
    feedback.textContent = '';
  });
}


// ---------- CART page rendering ----------
function renderCartPage() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryEl = document.getElementById('cartDelivery');
  const totalEl = document.getElementById('cartTotal');

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = '<p class="muted" style="font-size: large;" >Your cart is empty. Add items from the menu.</p>';
    subtotalEl.textContent = '₹0';
    totalEl.textContent = '₹0';
    return;
  }

  container.innerHTML = cart.map((it, idx) => `
    <div class="cart-row" data-idx="${idx}" >
      <img src="${it.img}" alt="${escapeHtml(it.name)}" onerror="this.src='placeholder.png'"/>
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(it.name)}</div>
        <div class="muted">₹${it.price}</div>
      </div>
      <div class="qty-controls">
        <button onclick="changeQty(${idx}, -1)">-</button>
        <div id="qty-${idx}">1</div>
        <button onclick="changeQty(${idx}, 1)">+</button>
      </div>
      <div style="width:80px;text-align:right">₹<span id="rowTotal-${idx}">${it.price}</span></div>
      <div><button onclick="removeCartItem(${idx})" class="btn ghost">Remove</button></div>
    </div>
  `).join('');

  // store quantities state
  const quantities = cart.map(_=>1);
  function recalc() {
    const subtotal = cart.reduce((s,it,i)=> s + it.price * quantities[i], 0);
    document.getElementById('cartSubtotal').textContent = '₹' + subtotal;
    const delivery = parseInt(document.getElementById('cartDelivery').textContent.replace('₹','')) || 30;
    document.getElementById('cartTotal').textContent = '₹' + (subtotal + delivery);
  }

  window.changeQty = function(idx, delta){
    quantities[idx] = Math.max(1, quantities[idx] + delta);
    document.getElementById('qty-'+idx).textContent = quantities[idx];
    document.getElementById('rowTotal-'+idx).textContent = cart[idx].price * quantities[idx];
    recalc();
  };

  window.removeCartItem = function(idx) {
    cart.splice(idx,1);
    saveCart(cart);
    renderCartPage();
    updateCartCount();
  };

  // attach checkout handler
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
      checkoutBtn.onclick = async function () {
        const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
        if (!user) {
          alert('Please login first');
          return location.href = 'login.html';
        }

        // Ask for order type
        const choice = prompt("Choose order type: Type '1' for Home Delivery or '2' for Dine-In");
        if (!choice) return;

        if (choice === '1') {
          // --- Home Delivery ---
          const deliveryDiv = document.createElement('div');
          deliveryDiv.innerHTML = `
            <div style="margin-top:20px;padding:15px;border:1px solid #ccc;border-radius:10px;background:#fff8e1;">
              <h3>Home Delivery Details</h3>
              <label>Name:</label>
              <input id="delName" value="${user.name || ''}" readonly style="width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;">
              <label>Phone Number:</label>
              <input id="delPhone" type="tel" placeholder="Enter phone number" style="width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;">
              <label>Address:</label>
              <textarea id="delAddress" rows="3" placeholder="Enter full address" style="width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
              <button id="confirmDeliveryBtn" class="btn primary" style="margin-top:8px;">Confirm Order</button>
            </div>
          `;
          const summary = document.querySelector('.cart-summary');
          summary.appendChild(deliveryDiv);

          document.getElementById('confirmDeliveryBtn').onclick = async () => {
            const phone = document.getElementById('delPhone').value.trim();
            const address = document.getElementById('delAddress').value.trim();
            if (!phone || !address) return alert('Please fill all details');

            // --- Create and send order ---
            const orderItems = cart.map((it, i) => ({ name: it.name, price: it.price, qty: quantities[i] || 1 }));
            const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
            const delivery = parseInt(document.getElementById('cartDelivery').textContent.replace('₹', '')) || 30;
            const body = {
              userEmail: user.email,
              items: orderItems,
              total: subtotal + delivery,
              deliveryType: 'Home Delivery',
              phone,
              address
            };

            try {
              const res = await fetch(API_BASE + '/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              const data = await res.json();
              const msgEl = document.getElementById('orderMessage');
              if (res.ok && data.success) {
                msgEl.style.color = 'green';
                msgEl.innerHTML = '🍱 Your food is coming! Get ready to receive it. We wish your day goes great!';
                localStorage.setItem('restaurant_cart', '[]');
                setTimeout(() => { renderCartPage(); updateCartCount(); showSuccessMessage(); }, 2000);
              } else {
                msgEl.style.color = '#d32f2f';
                msgEl.textContent = data.message || 'Order failed';
              }
            } catch (err) {
              console.error(err);
              alert('Server error while placing order');
            }
          };

        } else if (choice === '2') {
          // --- Dine-In ---
          const msgEl = document.getElementById('orderMessage');
          msgEl.style.color = 'green';
          msgEl.innerHTML = '🍽️ Thank you! Your table will be ready shortly. Enjoy your dining experience at Taste Heaven!';
          localStorage.setItem('restaurant_cart', '[]');
          setTimeout(() => { renderCartPage(); updateCartCount(); }, 2000);
        } else {
          alert('Invalid choice, please type 1 or 2.');
        }
      };
    }
  recalc();
}
// attach clear cart handler
const clearCartBtn = document.getElementById('clearCartBtn');
if (clearCartBtn) {
  clearCartBtn.onclick = function () {
    if (confirm('Are you sure you want to clear your cart?')) {
      localStorage.setItem('restaurant_cart', '[]');  // clear localStorage cart
      renderCartPage();  // refresh the cart UI
      updateCartCount(); // update cart icon count
    }
  };
}

// ---------- LOGIN GREETING (Global) ----------
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
  const loginNav = document.getElementById('loginNav');
  const userGreeting = document.getElementById('userGreeting');

  if (!loginNav || !userGreeting) return;

  if (user) {
    userGreeting.textContent = `Hi, ${user.name || 'User'}`;
    loginNav.style.display = 'none';
  } else {
    userGreeting.textContent = '';
    loginNav.style.display = 'inline-block';
  }
});
// ---------- LOGIN GREETING + LOGOUT ----------
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
  const loginNav = document.getElementById('loginNav');
  const logoutNav = document.getElementById('logoutNav');
  const userGreeting = document.getElementById('userGreeting');

  if (!loginNav || !logoutNav || !userGreeting) return;

  if (user) {
    // Show greeting and logout
    userGreeting.textContent = `Hi, ${user.name || 'User'} `;
    loginNav.style.display = 'none';
    logoutNav.style.display = 'inline-block';
  } else {
    // Show login only
    userGreeting.textContent = '';
    userGreeting.style.display = 'none';
    loginNav.style.display = 'inline-block';
    logoutNav.style.display = 'none';
  }

  // Logout event
  logoutNav.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('restaurant_user');
    alert('You have been logged out.');
    location.reload();
  });
});

// ---------- UTIL ----------
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }





