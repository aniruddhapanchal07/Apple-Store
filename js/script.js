// --- CSV Storage Functions ---
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0 || lines[0] === '') return [];
  
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }
  return data;
}

function arrayToCSV(array, headers) {
  if (array.length === 0) return headers.join(',') + '\n';
  
  const csvContent = headers.join(',') + '\n' + 
    array.map(row => headers.map(header => row[header] || '').join(',')).join('\n');
  return csvContent;
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function loadCSVData(key) {
  const csvData = localStorage.getItem(key);
  if (!csvData) return [];
  return parseCSV(csvData);
}

function saveCSVData(key, data, headers) {
  const csvContent = arrayToCSV(data, headers);
  localStorage.setItem(key, csvContent);
}

// --- User Authentication ---
let currentUser = null;
const authBtn = document.getElementById('auth-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');
const signinBtn = document.getElementById('signin-btn');
const signupBtn = document.getElementById('signup-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupName = document.getElementById('signup-name');
const confirmPassword = document.getElementById('confirm-password');
const loginResult = document.getElementById('login-result');
const signupResult = document.getElementById('signup-result');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

function showLoginModal() {
  loginResult.textContent = '';
  loginResult.style.display = 'none';
  loginEmail.value = '';
  loginPassword.value = '';
  loginModal.classList.remove('hidden');
  signupModal.classList.add('hidden');
}

function showSignupModal() {
  signupResult.textContent = '';
  signupResult.style.display = 'none';
  signupName.value = '';
  signupEmail.value = '';
  signupPassword.value = '';
  confirmPassword.value = '';
  // Reset password strength indicator
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  if (strengthFill) strengthFill.style.width = '0%';
  if (strengthText) strengthText.textContent = 'Password strength';
  signupModal.classList.remove('hidden');
  loginModal.classList.add('hidden');
}

function closeAuthModals() {
  loginModal.classList.add('hidden');
  signupModal.classList.add('hidden');
}

// Check if user is logged in on page load
function checkUserSession() {
  const users = loadCSVData('users');
  const sessionUser = localStorage.getItem('currentUser');
  if (sessionUser) {
    const user = users.find(u => u.email === sessionUser);
    if (user) {
      currentUser = user;
      updateUIForLoggedInUser(user.email);
      return true;
    }
  }
  return false;
}

function updateUIForLoggedInUser(email) {
  userInfo.textContent = ''; // Don't show email in UI
  authBtn.style.display = 'none';
  logoutBtn.style.display = '';
  closeAuthModals();
}

function updateUIForLoggedOutUser() {
  userInfo.textContent = '';
  authBtn.style.display = '';
  logoutBtn.style.display = 'none';
  currentUser = null;
  localStorage.removeItem('currentUser');
}

authBtn.onclick = showLoginModal;
closeLogin.onclick = closeAuthModals;
closeSignup.onclick = closeAuthModals;
switchToSignup.onclick = showSignupModal;
switchToLogin.onclick = showLoginModal;

signinBtn.onclick = function() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) {
    showLoginResult("Please enter email and password.", 'error');
    return;
  }
  
  const users = loadCSVData('users');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', email);
    updateUIForLoggedInUser(email);
    showLoginResult('Welcome back!', 'success');
    setTimeout(() => {
      closeAuthModals();
    }, 1000);
  } else {
    showLoginResult("Invalid email or password.", 'error');
  }
};

signupBtn.onclick = function() {
  // Use enhanced validation
  if (!validateSignupForm()) return;
  
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const newsletter = document.getElementById('newsletter').checked;
  
  let users = loadCSVData('users');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    showSignupResult("User already exists with this email.", 'error');
    return;
  }
  
  // Add new user with enhanced data
  const newUser = { 
    name: name,
    email: email, 
    password: password,
    newsletter: newsletter ? 'yes' : 'no',
    created: new Date().toLocaleDateString()
  };
  
  users.push(newUser);
  saveCSVData('users', users, ['name', 'email', 'password', 'newsletter', 'created']);
  
  currentUser = newUser;
  localStorage.setItem('currentUser', email);
  updateUIForLoggedInUser(email);
  showSignupResult('Account created successfully! Welcome to Apple Store.', 'success');
  
  setTimeout(() => {
    closeAuthModals();
  }, 1500);
};

logoutBtn.onclick = function() {
  updateUIForLoggedOutUser();
  showLoginModal(); // Show login modal after logout
};


function requireAuth(action) {
  if (!currentUser) {
    alert('Please sign in first!');
    showLoginModal();
    return false;
  }
  return true;
}



// --- Product Data ---
const products = [
  {
    id: 'mb-air',
    name: 'MacBook Air M2',
    category: 'MacBooks',
    price: 119900,
    image: 'assets/macbook-air.png'
  },
  {
    id: 'mb-pro',
    name: 'MacBook Pro 14”',
    category: 'MacBooks',
    price: 199900,
    image: 'assets/macbook-pro.png'
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    category: 'iPhones',
    price: 79999,
    image: 'assets/iphone-16.png'
  },
  {
    id: 'iphone-16pro',
    name: 'iPhone 16 Pro',
    category: 'iPhones',
    price: 129999,
    image: 'assets/iphone-16-pro.png'
  },
  {
    id: 'airpods-pro',
    name: 'AirPods Pro',
    category: 'Accessories',
    price: 24999,
    image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=600&hei=600&fmt=jpeg&qlt=95&.v=1660803972361'
  }
];

// --- Utilities ---
function formatRupees(x) {
  return x.toLocaleString('en-IN');
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// --- Rendering Functions ---
function renderProducts(prodArray) {
  const prodList = document.getElementById('product-list');
  prodList.innerHTML = '';
  for (const prod of prodArray) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p class="price">₹${formatRupees(prod.price)}</p>
      <p>${prod.category}</p>
      <button onclick="addToCart('${prod.id}')">Add to Cart</button>
      <button onclick="addToWishlist('${prod.id}')">Add to Wishlist</button>
    `;
    prodList.appendChild(div);
  }
}

// --- Cart/Wishlist Logic ---
window.addToCart = function(id) {
  if (!requireAuth()) return;
  let cart = load('cart');
  cart.push(id);
  save('cart', cart);
  updateCounts();
  alert('Added to cart!');
};
window.addToWishlist = function(id) {
  if (!requireAuth()) return;
  let wish = load('wishlist');
  if (!wish.includes(id)) wish.push(id);
  save('wishlist', wish);
  updateCounts();
  alert('Added to wishlist!');
};

function updateCounts() {
  document.getElementById('cart-count').textContent = load('cart').length;
  document.getElementById('wishlist-count').textContent = load('wishlist').length;
  
  // Also update cart display if cart modal is currently open
  const cartModal = document.getElementById('cart-modal');
  if (!cartModal.classList.contains('hidden')) {
    const cartIds = load('cart');
    if (cartIds.length === 0) {
      closeModal('cart-modal');
    } else {
      renderCart();
    }
  }
}

// --- Modal Logic ---
function showModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.getElementById('cart-btn').onclick = () => { 
  const cartIds = load('cart');
  if (cartIds.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  renderCart(); 
  showModal('cart-modal'); 
};
document.getElementById('wishlist-btn').onclick = () => { 
  const wishIds = load('wishlist');
  if (wishIds.length === 0) {
    alert('Your wishlist is empty!');
    return;
  }
  renderWishlist(); 
  showModal('wishlist-modal'); 
};
document.getElementById('close-cart').onclick = () => closeModal('cart-modal');
document.getElementById('close-wishlist').onclick = () => closeModal('wishlist-modal');
document.getElementById('close-checkout').onclick = () => closeModal('checkout-modal');
document.getElementById('close-status').onclick = () => closeModal('status-modal');
document.getElementById('status-btn').onclick = () => { 
  // Clear form and results when opening status modal
  document.getElementById('status-form').reset();
  const statusResult = document.getElementById('status-result');
  statusResult.textContent = '';
  statusResult.style.display = 'none';
  showModal('status-modal'); 
};

// --- Cart Modal Render ---
function renderCart() {
  const ul = document.getElementById('cart-items');
  ul.innerHTML = '';
  const cartIds = load('cart');
  let total = 0;
  
  // Check if cart is empty and close modal if it is
  if (cartIds.length === 0) {
    closeModal('cart-modal');
    return;
  }
  
  for (const id of cartIds) {
    const prod = products.find(p => p.id === id);
    if (!prod) continue;
    total += prod.price;
    const li = document.createElement('li');
    li.innerHTML = `<img src="${prod.image}" style="width:36px;height:36px;vertical-align:middle;border-radius:8px;"> 
      ${prod.name} - ₹${formatRupees(prod.price)} 
      <button onclick="removeCart('${id}')">Remove</button>`;
    ul.appendChild(li);
  }
  document.getElementById('cart-total').textContent = formatRupees(total);
}
window.removeCart = function(id) {
  let cart = load('cart');
  cart = cart.filter(x => x !== id);
  save('cart', cart);
  updateCounts();
  
  // Check if cart is now empty and close modal
  if (cart.length === 0) {
    closeModal('cart-modal');
    alert('Cart is now empty!');
  } else {
    renderCart();
  }
};

function renderWishlist() {
  const ul = document.getElementById('wishlist-items');
  ul.innerHTML = '';
  const wishIds = load('wishlist');
  
  // Check if wishlist is empty and close modal if it is
  if (wishIds.length === 0) {
    closeModal('wishlist-modal');
    return;
  }
  
  for (const id of wishIds) {
    const prod = products.find(p => p.id === id);
    if (!prod) continue;
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${prod.image}" style="width:64px;height:64px;vertical-align:middle;border-radius:12px;object-fit:contain;">
      ${prod.name} - ₹${formatRupees(prod.price)} 
      <button onclick="removeWishlist('${id}')">Remove</button>
      <button onclick="moveToCart('${id}')">Move to Cart</button>
    `;
    ul.appendChild(li);
  }
}
window.moveToCart = function(id) {
  let cart = load('cart');
  if (!cart.includes(id)) {
    cart.push(id);
    save('cart', cart);
  }
  // Remove from wishlist after moving
  let wish = load('wishlist');
  wish = wish.filter(x => x !== id);
  save('wishlist', wish);
  updateCounts();
  
  // Check if wishlist is now empty and close modal
  if (wish.length === 0) {
    closeModal('wishlist-modal');
    alert('Item moved to cart! Wishlist is now empty.');
  } else {
    renderWishlist();
    alert('Moved to cart!');
  }
};

window.removeWishlist = function(id) {
  let wish = load('wishlist');
  wish = wish.filter(x => x !== id);
  save('wishlist', wish);
  updateCounts();
  
  // Check if wishlist is now empty and close modal
  if (wish.length === 0) {
    closeModal('wishlist-modal');
    alert('Wishlist is now empty!');
  } else {
    renderWishlist();
  }
};

// --- Checkout Logic ---
document.getElementById('checkout-btn').onclick = () => {
  const cartIds = load('cart');
  if (cartIds.length === 0) {
    alert('Cart is empty.');
    closeModal('cart-modal');
    return;
  }
  const checkoutResult = document.getElementById('checkout-result');
  checkoutResult.textContent = '';
  checkoutResult.style.display = 'none';
  showModal('checkout-modal');
};
document.getElementById('checkout-form').onsubmit = function(e) {
  e.preventDefault();
  const fullname = this.fullname.value.trim();
  const email = this.email.value.trim();
  const cartIds = load('cart');
  if (!fullname || !email || cartIds.length === 0) return;

  // Save order to CSV
  let orders = loadCSVData('orders');
  const newOrder = {
    id: Date.now().toString(),
    fullname: fullname,
    email: email,
    items: cartIds.join(';'), // Store items as semicolon-separated string
    timestamp: new Date().toISOString(),
    userEmail: currentUser.email
  };
  
  orders.push(newOrder);
  saveCSVData('orders', orders, ['id', 'fullname', 'email', 'items', 'timestamp', 'userEmail']);

  // Clear cart
  save('cart', []);
  updateCounts();

  // Show success message
  const checkoutResult = document.getElementById('checkout-result');
  checkoutResult.textContent = 'Order placed successfully!';
  checkoutResult.style.display = 'block';
  
  // Close both cart and checkout modals after a short delay
  setTimeout(() => {
    closeModal('checkout-modal');
    closeModal('cart-modal');
    // Clear the form
    document.getElementById('checkout-form').reset();
    checkoutResult.textContent = '';
    checkoutResult.style.display = 'none';
  }, 1500);
};

function handleCategory(evt) {
  document.querySelectorAll('.categories button').forEach(b => b.classList.remove('active'));
  evt.target.classList.add('active');
  const cat = evt.target.dataset.category;
  curCategory = cat;
  applyFilters();
}
document.querySelectorAll('.categories button').forEach(btn => btn.onclick = handleCategory);

let curCategory = 'All';
let curSort = 'name-asc';
document.getElementById('sort-select').onchange = function() {
  curSort = this.value;
  applyFilters();
};

function applyFilters() {
  let p = [...products];
  if (curCategory !== 'All') {
    p = p.filter(prod => prod.category === curCategory);
  }
  if (curSort === 'name-asc') {
    p.sort((a,b)=> a.name.localeCompare(b.name));
  } else if (curSort === 'name-desc') {
    p.sort((a,b)=> b.name.localeCompare(a.name));
  } else if (curSort === 'price-asc') {
    p.sort((a,b)=> a.price - b.price);
  } else if (curSort === 'price-desc') {
    p.sort((a,b)=> b.price - a.price);
  }
  renderProducts(p);
}

window.onload = function() {
  updateCounts();
  
  // Check if user is already logged in
  if (!checkUserSession()) {
    // If no user session, show login modal immediately
    showLoginModal();
  }
  
  applyFilters();
};

// --- Order Status ---
document.getElementById('status-form').onsubmit = function(e) {
  e.preventDefault();
  const fullname = this.fullname.value.trim();
  const email = this.email.value.trim();
  const orders = loadCSVData('orders');
  const matches = orders.filter(o => o.fullname === fullname && o.email === email);
  const res = document.getElementById('status-result');
  
  if (matches.length > 0) {
    let ordersHtml = `<strong>Orders for ${fullname} (${email}):</strong><br><br>`;
    
    matches.forEach((order, index) => {
      const itemIds = order.items.split(';');
      const itemNames = itemIds.map(id => {
        const product = products.find(p => p.id === id);
        return product ? product.name : 'Unknown Product';
      });
      
      ordersHtml += `<div style="border: 1px solid #4DD784; padding: 10px; margin: 10px 0; border-radius: 5px;">
        <strong>Order ${index + 1}</strong><br>
        Order ID: <strong>${order.id}</strong><br>
        Date: <strong>${new Date(order.timestamp).toLocaleDateString()}</strong><br>
        Items:<br>
        <ul>${itemNames.map(name => `<li>${name}</li>`).join('')}</ul>
      </div>`;
    });
    
    res.innerHTML = ordersHtml;
    res.style.display = 'block';
  } else {
    res.textContent = 'No orders found for these details.';
    res.style.display = 'block';
  }
};

// Enhanced password strength checker
function checkPasswordStrength(password) {
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthFill || !strengthText) return;
  
  let strength = 0;
  let feedback = '';
  
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  
  strengthFill.style.width = strength + '%';
  
  if (strength === 0) {
    feedback = 'Too weak';
    strengthFill.style.background = '#ff4444';
  } else if (strength <= 50) {
    feedback = 'Weak';
    strengthFill.style.background = '#ff4444';
  } else if (strength <= 75) {
    feedback = 'Good';
    strengthFill.style.background = '#ffaa00';
  } else {
    feedback = 'Strong';
    strengthFill.style.background = '#00aa00';
  }
  
  strengthText.textContent = feedback;
}

// Enhanced signup validation
function validateSignupForm() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const termsAgreed = document.getElementById('terms-agree').checked;
  
  if (!name) {
    showSignupResult('Please enter your full name', 'error');
    return false;
  }
  
  if (!email) {
    showSignupResult('Please enter your email address', 'error');
    return false;
  }
  
  if (password.length < 8) {
    showSignupResult('Password must be at least 8 characters long', 'error');
    return false;
  }
  
  if (password !== confirmPassword) {
    showSignupResult('Passwords do not match', 'error');
    return false;
  }
  
  if (!termsAgreed) {
    showSignupResult('Please agree to the Terms & Conditions', 'error');
    return false;
  }
  
  return true;
}

// Enhanced result display functions
function showLoginResult(message, type = 'error') {
  const resultDiv = document.getElementById('login-result');
  resultDiv.textContent = message;
  resultDiv.style.display = 'block';
  resultDiv.style.color = type === 'error' ? '#ff4444' : '#00aa00';
  resultDiv.style.background = type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0,170,0,0.1)';
  resultDiv.style.padding = '0.75rem';
  resultDiv.style.borderRadius = '6px';
  resultDiv.style.border = `1px solid ${type === 'error' ? '#ff4444' : '#00aa00'}`;
}

function showSignupResult(message, type = 'error') {
  const resultDiv = document.getElementById('signup-result');
  resultDiv.textContent = message;
  resultDiv.style.display = 'block';
  resultDiv.style.color = type === 'error' ? '#ff4444' : '#00aa00';
  resultDiv.style.background = type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0,170,0,0.1)';
  resultDiv.style.padding = '0.75rem';
  resultDiv.style.borderRadius = '6px';
  resultDiv.style.border = `1px solid ${type === 'error' ? '#ff4444' : '#00aa00'}`;
}

// Updated event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Password strength checker
  const signupPasswordField = document.getElementById('signup-password');
  if (signupPasswordField) {
    signupPasswordField.addEventListener('input', function() {
      checkPasswordStrength(this.value);
    });
  }
});
