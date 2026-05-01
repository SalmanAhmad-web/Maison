fetch("./navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar-container").innerHTML = data;
      const menu = document.getElementById("sideMenu");
    const hamburger = document.querySelector(".hamburg"); // navbar me icon
    const closeBtn = document.querySelector(".close-menu"); // close icon inside menu

    if(hamburger && menu && closeBtn) {
      hamburger.addEventListener("click", () => {
        console.log("clicked");
        menu.classList.add("active");
      });

      closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");
      });
    }
    console.log(hamburger, menu, closeBtn);

    initializeCart();
    updateCartBadge();
  });

fetch("./footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer-container").innerHTML = data;
  });


document.addEventListener("DOMContentLoaded", () => {
  cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  renderCart();
});
let currentProduct = null; // global product object

function initializeCart() {
  const cartBtn = document.querySelector(".cart-icon");
  const cartPanel = document.getElementById("cart");
  const closeBtn = document.querySelector(".close");
  const cartOverlay = document.getElementById("cart-overlay");

  if (cartBtn && cartPanel) {
    cartBtn.addEventListener("click", function () {
      cartPanel.classList.add("active");
      cartOverlay.classList.add("active");
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && cartPanel) {
    closeBtn.addEventListener("click", function () {
      cartPanel.classList.remove("active");
      cartOverlay.classList.remove("active");
      document.body.style.overflow = '';
    });
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", function () {
      cartPanel.classList.remove("active");
      cartOverlay.classList.remove("active");
      document.body.style.overflow = '';
    });
  }

  renderCart();
}

function showEmptyCart() {
  const cartContent = document.querySelector('.cart-content');
  const cartHead = document.querySelector('.cart-head p');

  if (cartContent) {
    cartContent.innerHTML = `
      <div class="cart-main">
        <p class="empty">YOUR CART IS CURRENTLY EMPTY</p>
        <p class="return" onclick="window.location.href='index.html'">RETURN TO SHOP</p>
      </div>
    `;
  }

  if (cartHead) cartHead.textContent = 'Cart(0)';
}

const sizeButtons = document.querySelectorAll('.size button');
let selectedSize = null;

sizeButtons.forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();

    sizeButtons.forEach(b => {
      b.style.background = 'transparent';
      b.style.color = 'black';
    });

    this.style.background = 'black';
    this.style.color = 'white';
    selectedSize = this.innerText;

    const alertBox = document.querySelector(".alert");
    if (alertBox) {
      alertBox.innerText = "";
    }
  });
});

document.addEventListener('click', function () {
  sizeButtons.forEach(b => {
    b.style.background = 'transparent';
    b.style.color = 'black';
  });
  selectedSize = null;
});

const addCartBtn = document.querySelector('.add-cart');

if (addCartBtn) {
  addCartBtn.addEventListener('click', function () {
    if (!selectedSize) {
      const alertBox = document.querySelector(".alert");
      alertBox.innerText = "Please select a size.";
      alertBox.style.color = "red";
      return;
    }

    const name = document.querySelector('.p-name').innerText;
    const price = document.querySelector('.p-price').innerText;
    const imgSrc = document.querySelector('.p-img img').src;
    const variant = currentProduct?.variants?.find(
      v => v.option2.toLowerCase() === selectedSize.toLowerCase()
    );

    console.log("currentProduct variant is", variant);

    const variantId = variant?.id;
    if (!variantId) {
      console.log("Variant ID not found for selected size");
    } else {
      console.log("Variant ID:", variantId);
    }

    if (!variantId) {
      console.error("Variant ID not found for selected size");
      return;
    }
    addItemToCart(name, price, imgSrc, selectedSize, variantId);
  });
}

let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
function addItemToCart(name, price, imgSrc, size, variantId) {
  const cartContent = document.querySelector('.cart-content');
  const cartHead = document.querySelector('.cart-head p');

  // Check if item already exists
  const existingItem = cartItems.find(item => item.name === name && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      name: name,
      price: price,
      imgSrc: imgSrc,
      size: size,
      quantity: 1,
      variantId: variantId

    });
  }

  // ✅ Save to localStorage
  saveCartToStorage();

  // ✅ Cart render karo
  renderCart();
  updateCartBadge();

  // ✅ Cart automatically open karo
  const cartPanel = document.getElementById('cart');
  if (cartPanel) cartPanel.classList.add('active');

  console.log("Item added to cart!", cartItems);
}

// ✅ Save cart to localStorage function
function saveCartToStorage() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}




function renderCart() {
  const cartContent = document.querySelector('.cart-content');
  const cartHead = document.querySelector('.cart-head p');


  if (!cartContent) return;

  if (cartItems.length === 0) {
    showEmptyCart();
    return;
  }

  // Total items count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (cartHead) cartHead.textContent = `Cart (${totalItems})`;

  // Empty string to collect all items HTML
  let itemsHTML = '';
  let subtotal = 0;

  // Loop through each item
  cartItems.forEach((item, index) => {
    const priceNum = parseFloat(item.price.replace('€', ''));
    subtotal += priceNum * item.quantity;

    // Add to itemsHTML (note: += means append)
    itemsHTML += `
            <div class="cart-fill">
                <img src="${item.imgSrc}" alt="${item.name}">
                <div class="p-details">
                    <p class="cart-p-name">${item.name}</p>
                    <p>Size: <span class="p-Size">${item.size}</span></p>                    
                    <p class="cart-p-price">${item.price}</p>
                    <div class="p-quantity">
                        <button class="decrement" onclick="updateQuantity(${index}, -1)">−</button>
                        <p class="quantity">${item.quantity}</p>
                        <button class="increment" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <p class="p-del" onclick="removeItem(${index})">Remove</p>
            </div>
        `;
  });

  // Checkout section
  const checkoutHTML = `
        <div class="checkout">
            <div class="subTotal">
                <p>Subtotal</p>
                <p class="total">€${subtotal.toFixed(2)}</p>
            </div>
            <p class="c-para">Shipping calculated at checkout</p>
            <button class="checkout-btn" onclick="window.location.href='checkout.html'">Proceed to Checkout</button>
        </div>
    `;

  // Combine and insert
  cartContent.innerHTML = itemsHTML + checkoutHTML;
}

function updateQuantity(index, change) {
  cartItems[index].quantity += change;

  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }

  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

function removeItem(index) {
  cartItems.splice(index, 1);

  saveCartToStorage();

  renderCart();
  updateCartBadge();
}

// ===== CART BADGE UPDATE =====
function updateCartBadge() {

  // ✅ Always latest cart from localStorage lo
  cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  const badge = document.querySelector('.cart-badge');
  const cartHead = document.querySelector('.cart-head p');

  // Total quantity count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (badge) {
    badge.textContent = totalItems;

    if (totalItems > 0) {

      badge.classList.add('show');

      // animation
      badge.classList.add('pop');
      setTimeout(() => {
        badge.classList.remove('pop');
      }, 300);

    } else {

      badge.classList.remove('show');
      badge.textContent = "0";

    }
  }
  if (cartHead) {
    cartHead.textContent = `Cart (${totalItems})`;
  }
}

async function getProducts() {
  try {
    const response = await fetch("https://blockjob.taimoorproject.site/api/shopify-products");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const dataResponse = await response.json();
    let products = dataResponse.data.products;
    let cardsContainer = document.getElementById("cards");

    let html = "";
    products.forEach(product => {
      let image = product.images?.[0]?.src || "";
      let title = product.title || "";
      let price = product.variants?.[0]?.price || "";

      html += `
        <div class="card" data-id="${product.id}">
          <img src="${image}" alt="${title}">
          <p class="para">${product.product_type || ""}</p>
          <h3 class="name">${title}</h3>
          <p class="price">€${price}</p>
        </div>
      `;
    });

    cardsContainer.innerHTML = html;

    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const productId = card.getAttribute("data-id");
        window.location.href = `product.html?id=${productId}`;
      });
    });

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

getProducts();

document.addEventListener("click", function (e) {
  const card = e.target.closest(".card");
  if (!card) return;

  const productId = card.dataset.id;
  if (!productId) return;

  window.location.href = `product.html?id=${productId}`;
});

// URL se product ID lo
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (productId) {
  loadProduct();
}
async function loadProduct() {
  try {
    const response = await fetch(
      `https://blockjob.taimoorproject.site/api/shopify-products/${productId}`
    );
    const result = await response.json();
    const product = result.data?.product || result.data || result;
    if (!product) {
      return;
    }
    currentProduct = product;

    document.querySelector(".p-img img").src =
      product.images?.[0]?.src || "";
    document.querySelector(".variant-img1").src =
      product.images?.[1]?.src || "";
    document.querySelector(".variant-img2").src =
      product.images?.[2]?.src || "";
    document.querySelector(".variant-img3").src =
      product.images?.[3]?.src || "";

    document.querySelector(".p-title").textContent =
      product.product_type || "";

    document.querySelector(".p-name").textContent =
      product.title || "";

    document.querySelector(".description").textContent =
      product.vendor || "";

    document.querySelector(".p-price").textContent =
      `€${product.variants?.[0]?.price || ""}`;

    document.querySelector(".details").textContent =
      product.body_html?.replace(/<[^>]*>/g, "") || "";

  } catch (error) {
    console.error("Error loading product:", error);
  }
}
document.addEventListener("click", function (e) {

  const clickedThumb = e.target.closest(".variant-images img");
  if (!clickedThumb) return;

  const mainImage = document.querySelector(".main-product-img");

  mainImage.style.opacity = "0";

  setTimeout(() => {
    const tempSrc = mainImage.src;
    mainImage.src = clickedThumb.src;
    clickedThumb.src = tempSrc;
    mainImage.style.opacity = "1";
  }, 150);

});

document.querySelector("#explore-btn").addEventListener("click", () => {
  document.querySelector("#cards").scrollIntoView({
    behavior: "smooth"
  });
});


let cardsContainer = document.getElementById("cards");
let viewAll = document.querySelector("#view-btn");
viewAll.addEventListener("click", ()=> {
  const isShow = cardsContainer.classList.contains("show-all");
  if (isShow) {
    cardsContainer.classList.remove("show-all");
    viewAll.textContent = "View All";
  } else {
    cardsContainer.classList.add("show-all");
    viewAll.textContent = "Show Less";
  }
});



let form = document.querySelector("#cForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let formdata = new FormData(form);
  let orderData = Object.fromEntries(formdata.entries());
  let cartItems = JSON.parse(localStorage.getItem("cartItems"))
cartItems.forEach((item, i) => {
  const variantId = item.variantId;
 const price = item.price || 1;

const cleanPrice = parseFloat(price.replace("€", ""));

  // Add to the object with unique keys
  orderData[`variant_id`] = variantId;
    orderData[`price`] = cleanPrice;

});

console.log("data to paas in api", orderData)
  let response = fetch("https://blockjob.taimoorproject.site/api/shopify-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });


  console.log(response)
});


