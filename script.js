// DOMContentLoaded event to ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    fetchFoodItems();  // Fetch food items from the server
    setupEventListeners();  // Set up UI event listeners
});

// Global cart array
let cart = [];

// Fetch food items from the Flask API and render them
function fetchFoodItems() {
    fetch('http://127.0.0.1:5000/api/food')
        .then(response => response.json())
        .then(data => renderFoodItems(data))
        .catch(error => console.error('Error fetching food items:', error));
}

// Set up event listeners for various UI elements
function setupEventListeners() {
    document.querySelector('.close-button').addEventListener('click', () => document.getElementById('payment-modal').style.display = 'none');
    document.getElementById('toggle-cart').addEventListener('click', toggleCartVisibility);
    document.getElementById('empty-cart').addEventListener('click', emptyCart);
    document.getElementById('checkout').addEventListener('click', openPaymentModal);
    document.getElementById('payment-form').addEventListener('submit', processPayment);
    document.getElementById('search-bar').addEventListener('input', handleSearch);
}

function openPaymentModal() {
    document.getElementById('payment-modal').style.display = 'block';  // Make the payment modal visible
    updateFinalTotal();  // Optionally update the final total in the modal if it differs from the cart
}

function updateFinalTotal() {
    const finalTotalElement = document.getElementById('final-total-price');
    let total = 0;
    cart.forEach(item => total += item.price * item.quantity);
    finalTotalElement.textContent = `Total: $${total.toFixed(2)}`; // Ensure two decimal places
}


// Toggle visibility of the shopping cart sidebar
function toggleCartVisibility() {
    const cartAside = document.getElementById('cart-aside');
    cartAside.classList.toggle('expanded');
}

// Empty the shopping cart and re-render
function emptyCart() {
    cart = [];
    renderCartItems();
}

// Process payment form submission
function processPayment(event) {
    event.preventDefault();
    alert('Payment Successful!');
    emptyCart();
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('cart-aside').classList.remove('expanded');
}

// Handle dynamic search filtering
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    fetch('http://127.0.0.1:5000/api/food')
        .then(response => response.json())
        .then(foods => renderFoodItems(foods.filter(food => food.name.toLowerCase().includes(searchTerm))))
        .catch(error => console.error('Error fetching or filtering food items:', error));
}

// Render food items to the DOM
function renderFoodItems(items) {
    const foodList = document.getElementById('food-list');
    foodList.innerHTML = '';
    items.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.classList.add('food-item');
        foodItem.innerHTML = `
            <img src="${food.image_url}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p>$${food.price}</p>
            <button onclick="addToCart(${food.id}, '${food.name}', ${food.price})">Add to Cart</button>
        `;
        foodList.appendChild(foodItem);
    });
}

// Add an item to the shopping cart
function addToCart(id, name, price) {
    const cartItem = { id, name, price, quantity: 1 };
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(cartItem);
    }
    renderCartItems();
    showAddToCartNotification(name);
}

// Render the contents of the shopping cart
function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('inline');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            ${item.name} $${item.price.toFixed(2)}
            <span class="item-quantity">x${item.quantity}</span>
            <button class="minus-btn" onclick="updateQuantity('minus', ${item.id})">-</button>
            <button class="plus-btn" onclick="updateQuantity('plus', ${item.id})">+</button>
            <span class="remove-item" onclick="removeFromCart(${item.id})">&times;</span>
        `;
        cartItems.appendChild(cartItem);
    });
    document.getElementById('total-price').textContent = `Total: $${calculateTotal().toFixed(2)}`;
}

function calculateTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Remove an item from the cart
function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
    }
    renderCartItems();
}

function updateQuantity(action, itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    if (action === 'plus') {
        cartItem.quantity += 1;
    } else if (action === 'minus' && cartItem.quantity > 1) {
        cartItem.quantity -= 1;
    } else if (action === 'minus' && cartItem.quantity === 1) {
        removeFromCart(itemId); // Optionally remove the item if quantity reaches 0
        return;
    }
    renderCartItems(); // Re-render the cart to update the display
}

// Display a notification when an item is added to the cart
function showAddToCartNotification(itemName) {
    const notification = document.createElement('div');
    notification.textContent = `${itemName} added to cart!`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.backgroundColor = 'red';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1001';
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000); // Notification disappears after 3000ms
}