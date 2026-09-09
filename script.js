const ORDER_EMAIL = "shopatluxurie@gmail.com";
const DELIVERY_FEE = 0;

// PUT YOUR FLUTTERWAVE PUBLIC KEY HERE
const FLUTTERWAVE_PUBLIC_KEY = "YOUR_FLUTTERWAVE_PUBLIC_KEY";

// Crypto wallet
const CRYPTO_WALLET_ADDRESS =
  "0xB7eee0CE50092919E7Aec0Cfb3ABD279052b7A96";


// ============================================================
// PRODUCTS
// ============================================================

const PRODUCTS = [
  {
    id: "earbuds",
    name: "Wireless Earbuds",
    category: "Audio essential",
    price: 39,
    image: "images/earbuds.svg"
  },
  {
    id: "watch",
    name: "Smart Watch",
    category: "Everyday tech",
    price: 79,
    image: "images/watch.svg"
  },
  {
    id: "bottle",
    name: "Premium Water Bottle",
    category: "Daily essential",
    price: 24,
    image: "images/bottle.svg"
  },
  {
    id: "backpack",
    name: "Minimalist Backpack",
    category: "Everyday carry",
    price: 59,
    image: "images/backpack.svg"
  },
  {
    id: "sunglasses",
    name: "Classic Sunglasses",
    category: "Modern accessory",
    price: 34,
    image: "images/sunglasses.svg"
  },
  {
    id: "speaker",
    name: "Portable Speaker",
    category: "Audio essential",
    price: 49,
    image: "images/speaker.svg"
  }
];


// ============================================================
// STORE STATE
// ============================================================

const state = {
  cart: [],
  submitting: false
};


// ============================================================
// HELPERS
// ============================================================

function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(amount) || 0);
}


function findProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}


function cartCount() {
  return state.cart.reduce(
    (total, item) => total + item.qty,
    0
  );
}


function cartSubtotal() {
  return state.cart.reduce((total, item) => {
    const product = findProduct(item.id);

    if (!product) return total;

    return total + product.price * item.qty;
  }, 0);
}


function cartTotal() {
  return cartSubtotal() + DELIVERY_FEE;
}


// ============================================================
// PRODUCT DISPLAY
// ============================================================

function productCardHTML(product) {
  return `
    <article class="product-card">

      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >
      </div>

      <div class="product-card-body">

        <div class="product-name">
          ${product.name}
        </div>

        <div class="product-meta">
          ${product.category}
        </div>

        <div class="product-card-footer">

          <span class="product-price">
            ${formatUSD(product.price)}
          </span>

          <button
            type="button"
            class="btn btn-primary add-to-cart-btn"
            data-add="${product.id}"
          >
            Add to bag
          </button>

        </div>

      </div>

    </article>
  `;
}


function renderProducts() {
  const shopGrid =
    document.getElementById("shop-product-grid");

  const homeGrid =
    document.getElementById("home-product-grid");

  const productCount =
    document.getElementById("product-count-label");


  // SHOP PAGE
  if (shopGrid) {
    shopGrid.innerHTML =
      PRODUCTS.map(productCardHTML).join("");
  }


  // HOME PAGE - show first 3
  if (homeGrid) {
    homeGrid.innerHTML =
      PRODUCTS
        .slice(0, 3)
        .map(productCardHTML)
        .join("");
  }


  // PRODUCT COUNT
  if (productCount) {
    productCount.textContent =
      `${PRODUCTS.length} products`;
  }
}


// ============================================================
// CART
// ============================================================

function addToCart(productId) {
  const product = findProduct(productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  const existing =
    state.cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: productId,
      qty: 1
    });
  }

  renderCart();
  renderCheckoutSummary();
}


function increaseQty(productId) {
  const item =
    state.cart.find(x => x.id === productId);

  if (item) {
    item.qty += 1;
  }

  renderCart();
  renderCheckoutSummary();
}


function decreaseQty(productId) {
  const item =
    state.cart.find(x => x.id === productId);

  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {
    state.cart =
      state.cart.filter(x => x.id !== productId);
  }

  renderCart();
  renderCheckoutSummary();
}


function removeFromCart(productId) {
  state.cart =
    state.cart.filter(item => item.id !== productId);

  renderCart();
  renderCheckoutSummary();
}


// ============================================================
// CART DISPLAY
// ============================================================

function renderCart() {
  const count =
    document.getElementById("cart-count");

  const items =
    document.getElementById("cart-items");

  const empty =
    document.getElementById("cart-empty");

  const summary =
    document.getElementById("cart-summary");

  const subtotal =
    document.getElementById("cart-subtotal");


  if (count) {
    count.textContent = cartCount();
  }


  if (!items) return;


  if (state.cart.length === 0) {

    items.innerHTML = "";

    if (empty) {
      empty.hidden = false;
    }

    if (summary) {
      summary.hidden = true;
    }

    if (subtotal) {
      subtotal.textContent = formatUSD(0);
    }

    return;
  }


  if (empty) {
    empty.hidden = true;
  }

  if (summary) {
    summary.hidden = false;
  }


  items.innerHTML = state.cart
    .map(item => {

      const product =
        findProduct(item.id);

      if (!product) return "";


      return `
        <div class="cart-item">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div class="cart-item-info">

            <div class="cart-item-name">
              ${product.name}
            </div>

            <div class="cart-item-price">
              ${formatUSD(product.price)}
            </div>

          </div>


          <div class="qty-control">

            <button
              type="button"
              data-qty-decrease="${product.id}"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>
              ${item.qty}
            </span>

            <button
              type="button"
              data-qty-increase="${product.id}"
              aria-label="Increase quantity"
            >
              +
            </button>

          </div>


          <strong>
            ${formatUSD(product.price * item.qty)}
          </strong>


          <button
            type="button"
            class="cart-item-remove"
            data-remove="${product.id}"
          >
            Remove
          </button>

        </div>
      `;

    })
    .join("");


  if (subtotal) {
    subtotal.textContent =
      formatUSD(cartSubtotal());
  }
}


// ============================================================
// CHECKOUT SUMMARY
// ============================================================

function renderCheckoutSummary() {

  const body =
    document.getElementById(
      "checkout-summary-body"
    );

  const subtotal =
    document.getElementById(
      "checkout-subtotal"
    );

  const delivery =
    document.getElementById(
      "checkout-delivery"
    );

  const total =
    document.getElementById(
      "checkout-total"
    );


  if (!body) return;


  if (state.cart.length === 0) {
    body.innerHTML =
      "<p>Your cart is empty.</p>";

    if (subtotal) {
      subtotal.textContent =
        formatUSD(0);
    }

    if (delivery) {
      delivery.textContent =
        "Free";
    }

    if (total) {
      total.textContent =
        formatUSD(0);
    }

    return;
  }


  body.innerHTML = state.cart
    .map(item => {

      const product =
        findProduct(item.id);

      if (!product) return "";


      return `
        <div class="checkout-line">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div class="checkout-line-info">

            <strong>
              ${product.name}
            </strong>

            <span>
              ${item.qty} × ${formatUSD(product.price)}
            </span>

          </div>

          <strong>
            ${formatUSD(
              product.price * item.qty
            )}
          </strong>

        </div>
      `;

    })
    .join("");


  const sub = cartSubtotal();
  const totalAmount = cartTotal();


  if (subtotal) {
    subtotal.textContent =
      formatUSD(sub);
  }

  if (delivery) {
    delivery.textContent =
      DELIVERY_FEE > 0
        ? formatUSD(DELIVERY_FEE)
        : "Free";
  }

  if (total) {
    total.textContent =
      formatUSD(totalAmount);
  }
}


// ============================================================
// NAVIGATION
// ============================================================

function navigateTo(page) {

  const pages =
    document.querySelectorAll(".page");

  pages.forEach(section => {
    section.classList.toggle(
      "active",
      section.dataset.page === page
    );
  });


  document
    .querySelectorAll("[data-nav]")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.nav === page
      );

    });


  const mainNav =
    document.getElementById("main-nav");

  const menuToggle =
    document.getElementById("menu-toggle");


  if (mainNav) {
    mainNav.classList.remove("open");
  }

  if (menuToggle) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }


  if (page === "cart") {
    renderCart();
  }

  if (page === "checkout") {
    renderCheckoutSummary();
  }


  window.scrollTo({
    top: 0,
    behavior: "auto"
  });
}


// ============================================================
// ORDER NUMBER
// ============================================================

function generateOrderNumber() {

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `LX-${date}-${random}`;
}


// ============================================================
// FORM VALIDATION
// ============================================================

function clearFieldErrors() {

  document
    .querySelectorAll(".field-error")
    .forEach(element => {
      element.textContent = "";
    });

  document
    .querySelectorAll(".invalid")
    .forEach(element => {
      element.classList.remove("invalid");
    });
}


function setFieldError(id, message) {

  const input =
    document.getElementById(id);

  const error =
    document.querySelector(
      `[data-error-for="${id}"]`
    );


  if (input) {
    input.classList.add("invalid");
  }

  if (error) {
    error.textContent = message;
  }
}


function validateCheckout() {

  clearFieldErrors();

  let valid = true;


  const fullName =
    document
      .getElementById("full-name")
      .value
      .trim();

  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const phone =
    document
      .getElementById("phone")
      .value
      .trim();

  const address =
    document
      .getElementById("address")
      .value
      .trim();

  const city =
    document
      .getElementById("city")
      .value
      .trim();

  const stateValue =
    document
      .getElementById("state")
      .value;

  const zip =
    document
      .getElementById("zip")
      .value
      .trim();


  if (!fullName) {
    setFieldError(
      "full-name",
      "Enter your full name."
    );
    valid = false;
  }


  if (!email) {

    setFieldError(
      "email",
      "Enter your email address."
    );

    valid = false;

  } else if (
    !/^\S+@\S+\.\S+$/.test(email)
  ) {

    setFieldError(
      "email",
      "Enter a valid email address."
    );

    valid = false;
  }


  if (!phone) {
    setFieldError(
      "phone",
      "Enter your phone number."
    );
    valid = false;
  }


  if (!address) {
    setFieldError(
      "address",
      "Enter your street address."
    );
    valid = false;
  }


  if (!city) {
    setFieldError(
      "city",
      "Enter your city."
    );
    valid = false;
  }


  if (!stateValue) {
    setFieldError(
      "state",
      "Select your state."
    );
    valid = false;
  }


  if (!zip) {

    setFieldError(
      "zip",
      "Enter your ZIP code."
    );

    valid = false;

  } else if (
    !/^\d{5}(-\d{4})?$/.test(zip)
  ) {

    setFieldError(
      "zip",
      "Enter a valid U.S. ZIP code."
    );

    valid = false;
  }


  const paymentMethod =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value;


  if (paymentMethod === "Crypto") {

    const reference =
      document
        .getElementById(
          "payment-reference"
        )
        .value
        .trim();


    const screenshot =
      document.getElementById(
        "payment-screenshot"
      ).files[0];


    if (!reference) {

      setFieldError(
        "payment-reference",
        "Enter your crypto transaction reference."
      );

      valid = false;
    }


    if (!screenshot) {

      setFieldError(
        "payment-screenshot",
        "Upload your payment screenshot."
      );

      valid = false;

    } else if (
      screenshot.size >
      5 * 1024 * 1024
    ) {

      setFieldError(
        "payment-screenshot",
        "Screenshot must be 5 MB or smaller."
      );

      valid = false;
    }
  }


  return valid;
}


// ============================================================
// ORDER EMAIL
// ============================================================

function buildOrderText(order) {

  const itemLines =
    order.items
      .map(item =>
        `${item.name} × ${item.qty} — ${formatUSD(
          item.lineSubtotal
        )}`
      )
      .join("\n");


  return `
NEW LUXURIE ORDER

Order Number: ${order.orderNumber}

CUSTOMER
Name: ${order.fullName}
Email: ${order.email}
Phone: ${order.phone}

DELIVERY
Address: ${order.address}
City: ${order.city}
State: ${order.state}
ZIP: ${order.zip}

PAYMENT
Method: ${order.paymentMethod}
Status: ${order.paymentStatus}
Reference: ${order.paymentReference || "N/A"}

ORDER ITEMS
${itemLines}

Subtotal: ${formatUSD(order.subtotal)}
Delivery: ${
  order.deliveryFee
    ? formatUSD(order.deliveryFee)
    : "Free"
}
TOTAL: ${formatUSD(order.total)}

Placed: ${order.placedAt}
`.trim();
}


async function submitOrder(order, screenshot) {

  const endpoint =
    `https://formsubmit.co/ajax/${ORDER_EMAIL}`;


  const formData =
    new FormData();


  formData.append(
    "_subject",
    `New Luxurie Order ${order.orderNumber}`
  );

  formData.append(
    "_template",
    "table"
  );

  formData.append(
    "_captcha",
    "false"
  );

  formData.append(
    "_replyto",
    order.email
  );


  formData.append(
    "order_number",
    order.orderNumber
  );

  formData.append(
    "customer_name",
    order.fullName
  );

  formData.append(
    "phone",
    order.phone
  );

  formData.append(
    "email",
    order.email
  );

  formData.append(
    "address",
    order.address
  );

  formData.append(
    "city",
    order.city
  );

  formData.append(
    "state",
    order.state
  );

  formData.append(
    "zip",
    order.zip
  );


  formData.append(
    "payment_method",
    order.paymentMethod
  );

  formData.append(
    "payment_reference",
    order.paymentReference || "N/A"
  );

  formData.append(
    "payment_status",
    order.paymentStatus
  );


  formData.append(
    "order_details",
    buildOrderText(order)
  );


  formData.append(
    "subtotal",
    formatUSD(order.subtotal)
  );

  formData.append(
    "delivery_fee",
    order.deliveryFee
      ? formatUSD(order.deliveryFee)
      : "Free"
  );

  formData.append(
    "total",
    formatUSD(order.total)
  );

  formData.append(
    "placed_at",
    order.placedAt
  );


  if (screenshot) {

    formData.append(
      "payment_screenshot",
      screenshot,
      screenshot.name
    );
  }


  const response =
    await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });


  if (!response.ok) {
    throw new Error(
      "Order could not be submitted."
    );
  }


  return response;
}


// ============================================================
// PAYMENT UI
// ============================================================

function updatePaymentUI() {

  const method =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value;


  const cryptoBox =
    document.getElementById(
      "crypto-payment-box"
    );

  const flutterwaveNote =
    document.getElementById(
      "flutterwave-note"
    );

  const button =
    document.getElementById(
      "place-order-btn"
    );


  document
    .querySelectorAll(".radio-option")
    .forEach(option => {

      const input =
        option.querySelector(
          'input[name="paymentMethod"]'
        );

      option.classList.toggle(
        "selected",
        input && input.checked
      );

    });


  if (cryptoBox) {
    cryptoBox.hidden =
      method !== "Crypto";
  }


  if (flutterwaveNote) {
    flutterwaveNote.hidden =
      method === "Crypto";
  }


  if (button) {

    button.innerHTML =
      method === "Crypto"
        ? 'Submit Payment Proof <span>→</span>'
        : 'Continue to Secure Payment <span>→</span>';
  }
}


// ============================================================
// FLUTTERWAVE
// ============================================================

function openFlutterwaveCheckout(order) {

  return new Promise(
    (resolve, reject) => {

      if (
        !window.FlutterwaveCheckout
      ) {

        reject(
          new Error(
            "Flutterwave checkout is unavailable. Please refresh the page."
          )
        );

        return;
      }


      if (
        !FLUTTERWAVE_PUBLIC_KEY ||
        FLUTTERWAVE_PUBLIC_KEY.includes(
          "YOUR_FLUTTERWAVE"
        )
      ) {

        reject(
          new Error(
            "Add your Flutterwave public key in script.js first."
          )
        );

        return;
      }


      let completed = false;


      FlutterwaveCheckout({

        public_key:
          FLUTTERWAVE_PUBLIC_KEY,

        tx_ref:
          order.orderNumber,

        amount:
          Number(order.total),

        currency:
          "USD",

        // Enabled methods suitable for your account
        payment_options:
          "card,banktransfer,ussd,applepay",

        customer: {

          email:
            order.email,

          phone_number:
            order.phone,

          name:
            order.fullName
        },


        customizations: {

          title:
            "Luxurie",

          description:
            `Payment for Luxurie order ${order.orderNumber}`,

          logo:
            ""
        },


        meta: [

          {
            metaname:
              "order_number",

            metavalue:
              order.orderNumber
          }

        ],


        callback:
          function(response) {

            if (completed) return;

            completed = true;


            if (
              response.status !==
                "successful" ||
              !response.transaction_id
            ) {

              reject(
                new Error(
                  "Payment was not completed."
                )
              );

              return;
            }


            resolve(response);
          },


        onclose:
          function() {

            if (!completed) {

              reject(
                new Error(
                  "Payment was cancelled."
                )
              );
            }
          }

      });

    }
  );
}


// ============================================================
// VERIFY FLUTTERWAVE PAYMENT
// ============================================================

async function verifyFlutterwave(
  transactionId,
  reference,
  expectedAmount
) {

  const response =
    await fetch(
      "/api/verify-payment",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          transaction_id:
            transactionId,

          reference:
            reference,

          amount:
            Number(expectedAmount),

          currency:
            "USD"
        })
      }
    );


  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  if (
    !response.ok ||
    !data.verified
  ) {

    throw new Error(
      data.message ||
      "Payment could not be verified."
    );
  }


  return data;
}


// ============================================================
// CHECKOUT
// ============================================================

async function handleCheckoutSubmit(event) {

  event.preventDefault();


  if (state.submitting) {
    return;
  }


  const submitError =
    document.getElementById(
      "submit-error"
    );


  if (submitError) {
    submitError.hidden = true;
    submitError.textContent = "";
  }


  if (state.cart.length === 0) {

    navigateTo("cart");

    return;
  }


  if (!validateCheckout()) {
    return;
  }


  const paymentMethod =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value;


  const items =
    state.cart.map(item => {

      const product =
        findProduct(item.id);

      return {

        name:
          product.name,

        qty:
          item.qty,

        price:
          product.price,

        lineSubtotal:
          product.price * item.qty
      };

    });


  const subtotal =
    cartSubtotal();


  const order = {

    orderNumber:
      generateOrderNumber(),

    fullName:
      document
        .getElementById("full-name")
        .value
        .trim(),

    email:
      document
        .getElementById("email")
        .value
        .trim(),

    phone:
      document
        .getElementById("phone")
        .value
        .trim(),

    address:
      document
        .getElementById("address")
        .value
        .trim(),

    city:
      document
        .getElementById("city")
        .value
        .trim(),

    state:
      document
        .getElementById("state")
        .value,

    zip:
      document
        .getElementById("zip")
        .value
        .trim(),

    paymentMethod:
      paymentMethod,

    paymentReference:
      "",

    paymentStatus:
      paymentMethod === "Crypto"
        ? "Awaiting manual verification"
        : "Pending",

    items:
      items,

    subtotal:
      subtotal,

    deliveryFee:
      DELIVERY_FEE,

    total:
      subtotal + DELIVERY_FEE,

    placedAt:
      new Date().toLocaleString(
        "en-US",
        {
          timeZone:
            "America/New_York"
        }
      )
  };


  const button =
    document.getElementById(
      "place-order-btn"
    );


  state.submitting = true;


  if (button) {
    button.disabled = true;
    button.textContent =
      paymentMethod === "Crypto"
        ? "Submitting..."
        : "Opening secure payment...";
  }


  try {

    // ========================================================
    // FLUTTERWAVE
    // ========================================================

    if (
      paymentMethod === "Flutterwave"
    ) {

      const payment =
        await openFlutterwaveCheckout(
          order
        );


      if (button) {
        button.textContent =
          "Verifying payment...";
      }


      const verified =
        await verifyFlutterwave(
          payment.transaction_id,
          payment.tx_ref ||
            order.orderNumber,
          order.total
        );


      order.paymentReference =
        String(
          verified.transaction_id ||
          payment.transaction_id
        );


      order.paymentStatus =
        "Paid";


      await submitOrder(
        order,
        null
      );


      const confirmation =
        document.getElementById(
          "confirmation-order-number"
        );


      if (confirmation) {
        confirmation.textContent =
          order.orderNumber;
      }


      state.cart = [];


      renderCart();
      renderCheckoutSummary();


      document
        .getElementById(
          "checkout-form"
        )
        .reset();


      updatePaymentUI();


      navigateTo(
        "confirmation"
      );


      return;
    }


    // ========================================================
    // CRYPTO
    // ========================================================

    if (
      paymentMethod === "Crypto"
    ) {

      const reference =
        document
          .getElementById(
            "payment-reference"
          )
          .value
          .trim();


      const screenshot =
        document
          .getElementById(
            "payment-screenshot"
          )
          .files[0];


      order.paymentReference =
        reference;


      await submitOrder(
        order,
        screenshot
      );


      const confirmation =
        document.getElementById(
          "confirmation-order-number"
        );


      if (confirmation) {
        confirmation.textContent =
          order.orderNumber;
      }


      state.cart = [];


      renderCart();
      renderCheckoutSummary();


      document
        .getElementById(
          "checkout-form"
        )
        .reset();


      updatePaymentUI();


      navigateTo(
        "confirmation"
      );


      return;
    }


    throw new Error(
      "Please select a payment method."
    );


  } catch (error) {

    console.error(
      "Checkout error:",
      error
    );


    if (submitError) {

      submitError.hidden =
        false;

      submitError.textContent =
        error.message ||
        "Something went wrong. Your cart has been kept.";
    }


  } finally {

    state.submitting =
      false;


    if (button) {

      button.disabled =
        false;

      updatePaymentUI();
    }
  }
}


// ============================================================
// INITIALIZE STORE
// ============================================================

function init() {

  // Put products back on the page
  renderProducts();

  // Render cart
  renderCart();

  // Render checkout
  renderCheckoutSummary();


  // Crypto wallet
  const wallet =
    document.getElementById(
      "crypto-wallet-address"
    );

  if (wallet) {
    wallet.textContent =
      CRYPTO_WALLET_ADDRESS;
  }


  // Navigation
  document.body.addEventListener(
    "click",
    function(event) {

      // Navigation links
      const navLink =
        event.target.closest(
          "[data-nav]"
        );

      if (navLink) {

        event.preventDefault();

        navigateTo(
          navLink.dataset.nav
        );

        return;
      }


      // Add product
      const addButton =
        event.target.closest(
          "[data-add]"
        );

      if (addButton) {

        addToCart(
          addButton.dataset.add
        );


        const originalText =
          addButton.textContent;


        addButton.textContent =
          "Added ✓";


        setTimeout(
          () => {
            addButton.textContent =
              originalText;
          },
          900
        );


        return;
      }


      // Increase quantity
      const increase =
        event.target.closest(
          "[data-qty-increase]"
        );

      if (increase) {

        increaseQty(
          increase.dataset.qtyIncrease
        );

        return;
      }


      // Decrease quantity
      const decrease =
        event.target.closest(
          "[data-qty-decrease]"
        );

      if (decrease) {

        decreaseQty(
          decrease.dataset.qtyDecrease
        );

        return;
      }


      // Remove
      const remove =
        event.target.closest(
          "[data-remove]"
        );

      if (remove) {

        removeFromCart(
          remove.dataset.remove
        );

        return;
      }


      // Cart button
      if (
        event.target.closest(
          "#cart-btn"
        )
      ) {

        navigateTo("cart");

        return;
      }


      // Mobile menu
      if (
        event.target.closest(
          "#menu-toggle"
        )
      ) {

        const nav =
          document.getElementById(
            "main-nav"
          );

        const toggle =
          document.getElementById(
            "menu-toggle"
          );


        nav.classList.toggle(
          "open"
        );


        toggle.setAttribute(
          "aria-expanded",
          nav.classList.contains(
            "open"
          )
        );
      }

    }
  );


  // Checkout form
  const checkoutForm =
    document.getElementById(
      "checkout-form"
    );


  if (checkoutForm) {

    checkoutForm.addEventListener(
      "submit",
      handleCheckoutSubmit
    );
  }


  // Payment method
  document
    .querySelectorAll(
      'input[name="paymentMethod"]'
    )
    .forEach(input => {

      input.addEventListener(
        "change",
        updatePaymentUI
      );

    });


  updatePaymentUI();


  // Open correct page
  const initialPage =
    location.hash
      .replace("#", "")
      .trim();


  const validPage =
    document.getElementById(
      initialPage
    );


  navigateTo(
    validPage
      ? initialPage
      : "home"
  );
}


document.addEventListener(
  "DOMContentLoaded",
  init
);
