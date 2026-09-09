javascript
const ORDER_EMAIL = "shopatluxurie@gmail.com";
const DELIVERY_FEE = 0;

/*
 * Replace this with your Flutterwave PUBLIC key.
 *
 * Example:
 * const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK_TEST-xxxxxxxxxxxxxxxx";
 *
 * Never put your Flutterwave SECRET key here.
 */
const FLUTTERWAVE_PUBLIC_KEY = "YOUR_FLUTTERWAVE_PUBLIC_KEY";

const CRYPTO_WALLET_ADDRESS =
  "0xB7eee0CE50092919E7Aec0Cfb3ABD279052b7A96";

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

const state = {
  cart: [],
  submitting: false,
  paymentPending: false
};


function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}


function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}


function cartCount() {
  return state.cart.reduce((s, i) => s + i.qty, 0);
}


function cartSubtotal() {
  return state.cart.reduce((s, i) => {
    const p = findProduct(i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}


function productCardHTML(p) {
  return `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>

      <div class="product-card-body">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">${p.category}</div>

        <div class="product-card-footer">
          <span class="product-price">${formatUSD(p.price)}</span>

          <button
            class="add-to-cart-btn"
            data-add="${p.id}"
          >
            Add to bag
          </button>
        </div>
      </div>
    </article>
  `;
}


function renderProductGrids() {
  document.getElementById("shop-product-grid").innerHTML =
    PRODUCTS.map(productCardHTML).join("");

  document.getElementById("home-product-grid").innerHTML =
    PRODUCTS.slice(0, 3).map(productCardHTML).join("");

  document.getElementById("product-count-label").textContent =
    `${PRODUCTS.length} products`;
}


function renderCart() {
  document.getElementById("cart-count").textContent = cartCount();

  const items = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");

  if (!state.cart.length) {
    items.innerHTML = "";
    empty.hidden = false;
    summary.hidden = true;
    return;
  }

  empty.hidden = true;
  summary.hidden = false;

  items.innerHTML = state.cart.map(i => {
    const p = findProduct(i.id);

    return `
      <div class="cart-item">

        <img src="${p.image}" alt="${p.name}">

        <div>
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatUSD(p.price)} each</div>
        </div>

        <div class="qty-control">
          <button
            data-qty-decrease="${p.id}"
            aria-label="Decrease quantity"
          >−</button>

          <span>${i.qty}</span>

          <button
            data-qty-increase="${p.id}"
            aria-label="Increase quantity"
          >+</button>
        </div>

        <button
          class="cart-item-remove"
          data-remove="${p.id}"
        >
          Remove
        </button>

      </div>
    `;
  }).join("");

  document.getElementById("cart-subtotal").textContent =
    formatUSD(cartSubtotal());
}


function renderCheckoutSummary() {
  const body = document.getElementById("checkout-summary-body");
  const form = document.getElementById("checkout-form");

  if (!state.cart.length) {
    form.hidden = true;
    body.innerHTML = "";
    return;
  }

  form.hidden = false;

  body.innerHTML = state.cart.map(i => {
    const p = findProduct(i.id);

    return `
      <div class="checkout-line">

        <img src="${p.image}" alt="${p.name}">

        <div class="checkout-line-info">
          <strong>${p.name}</strong>
          <span>${i.qty} × ${formatUSD(p.price)}</span>
        </div>

        <strong style="margin-left:auto;font-size:11px">
          ${formatUSD(p.price * i.qty)}
        </strong>

      </div>
    `;
  }).join("");

  const sub = cartSubtotal();

  document.getElementById("checkout-subtotal").textContent =
    formatUSD(sub);

  document.getElementById("checkout-delivery").textContent =
    DELIVERY_FEE ? formatUSD(DELIVERY_FEE) : "Free";

  document.getElementById("checkout-total").textContent =
    formatUSD(sub + DELIVERY_FEE);
}


function addToCart(id) {
  const item = state.cart.find(i => i.id === id);

  if (item) {
    item.qty++;
  } else {
    state.cart.push({
      id,
      qty: 1
    });
  }

  renderCart();
}


function increaseQty(id) {
  const i = state.cart.find(x => x.id === id);

  if (i) i.qty++;

  renderCart();
}


function decreaseQty(id) {
  const i = state.cart.find(x => x.id === id);

  if (!i) return;

  i.qty--;

  if (i.qty < 1) {
    state.cart = state.cart.filter(x => x.id !== id);
  }

  renderCart();
}


function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  renderCart();
}


function navigateTo(page) {
  document.querySelectorAll(".page").forEach(x => {
    x.classList.toggle("active", x.dataset.page === page);
  });

  document.querySelectorAll(".main-nav a").forEach(x => {
    x.classList.toggle("active", x.dataset.nav === page);
  });

  const nav = document.getElementById("main-nav");

  nav.classList.remove("open");

  document
    .getElementById("menu-toggle")
    .setAttribute("aria-expanded", "false");

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  if (page === "cart") renderCart();

  if (page === "checkout") renderCheckoutSummary();

  if (page === "privacy") {
    history.replaceState(null, "", "#privacy");
  }
}


function generateOrderNumber() {
  const d = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return `LX-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
}


function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach(e => {
    e.textContent = "";
  });

  form.querySelectorAll(".invalid").forEach(e => {
    e.classList.remove("invalid");
  });
}


function setFieldError(id, msg) {
  const input = document.getElementById(id);
  const e = document.querySelector(
    `[data-error-for="${id}"]`
  );

  if (input) input.classList.add("invalid");

  if (e) e.textContent = msg;
}


function validate(form) {
  clearFieldErrors(form);

  let ok = true;

  const vals = {
    "full-name": document.getElementById("full-name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value,
    zip: document.getElementById("zip").value.trim()
  };

  for (const [id, msg] of [
    ["full-name", "Enter your full name."],
    ["email", "Enter your email address."],
    ["phone", "Enter your phone number."],
    ["address", "Enter your street address."],
    ["city", "Enter your city."],
    ["state", "Select your state."],
    ["zip", "Enter your ZIP code."]
  ]) {
    if (!vals[id]) {
      setFieldError(id, msg);
      ok = false;
    }
  }

  if (
    vals.email &&
    !/^\S+@\S+\.\S+$/.test(vals.email)
  ) {
    setFieldError(
      "email",
      "Enter a valid email address."
    );

    ok = false;
  }

  if (
    vals.zip &&
    !/^\d{5}(-\d{4})?$/.test(vals.zip)
  ) {
    setFieldError(
      "zip",
      "Enter a valid U.S. ZIP code."
    );

    ok = false;
  }

  const method =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value;

  if (method === "Crypto") {
    const ref =
      document
        .getElementById("payment-reference")
        .value
        .trim();

    const file =
      document
        .getElementById("payment-screenshot")
        .files[0];

    if (!ref) {
      setFieldError(
        "payment-reference",
        "Enter your crypto transaction reference."
      );

      ok = false;
    }

    if (!file) {
      setFieldError(
        "payment-screenshot",
        "Upload your payment screenshot."
      );

      ok = false;
    } else if (file.size > 5 * 1024 * 1024) {
      setFieldError(
        "payment-screenshot",
        "Screenshot must be 5 MB or smaller."
      );

      ok = false;
    }
  }

  return ok;
}


function buildOrderText(order) {
  const lines = [
    "NEW LUXURIE ORDER",
    "",
    `Order Number: ${order.orderNumber}`,
    "",
    "CUSTOMER",
    `Name: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    "",
    "DELIVERY",
    `Address: ${order.address}`,
    `City: ${order.city}`,
    `State: ${order.state}`,
    `ZIP: ${order.zip}`,
    "",
    "PAYMENT",
    `Method: ${order.paymentMethod}`,
    `Payment Reference: ${order.paymentReference || "Not applicable"}`,
    `Payment Status: ${order.paymentStatus}`,
    "",
    "ORDER"
  ];

  order.items.forEach(i => {
    lines.push(
      `${i.name} × ${i.qty} — ${formatUSD(i.lineSubtotal)}`
    );
  });

  lines.push(
    "",
    `Subtotal: ${formatUSD(order.subtotal)}`,
    `Delivery: ${order.deliveryFee ? formatUSD(order.deliveryFee) : "Free"}`,
    `TOTAL: ${formatUSD(order.total)}`,
    "",
    `Placed: ${order.placedAt}`
  );

  return lines.join("\n");
}


/*
 * Server-side Flutterwave verification.
 *
 * The secret key stays on Vercel.
 */
async function verifyFlutterwave(
  transactionId,
  reference,
  expectedAmount
) {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transaction_id: transactionId,
      reference,
      amount: Number(expectedAmount),
      currency: "USD"
    })
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok || !data.verified) {
    throw new Error(
      data.message || "Payment could not be verified."
    );
  }

  return data;
}


async function submitOrder(order, file) {
  const endpoint =
    `https://formsubmit.co/ajax/${ORDER_EMAIL}`;

  const fd = new FormData();

  fd.append(
    "_subject",
    `New Luxurie Order ${order.orderNumber}`
  );

  fd.append("_template", "table");
  fd.append("_captcha", "false");
  fd.append("_replyto", order.email);

  fd.append("order_number", order.orderNumber);
  fd.append("customer_name", order.fullName);
  fd.append("phone", order.phone);
  fd.append("email", order.email);
  fd.append("address", order.address);
  fd.append("city", order.city);
  fd.append("state", order.state);
  fd.append("zip", order.zip);

  fd.append("payment_method", order.paymentMethod);
  fd.append(
    "payment_reference",
    order.paymentReference || "Not applicable"
  );

  fd.append("payment_status", order.paymentStatus);

  fd.append(
    "order_details",
    buildOrderText(order)
  );

  fd.append(
    "subtotal",
    formatUSD(order.subtotal)
  );

  fd.append(
    "delivery_fee",
    order.deliveryFee
      ? formatUSD(order.deliveryFee)
      : "Free"
  );

  fd.append(
    "total",
    formatUSD(order.total)
  );

  fd.append(
    "placed_at",
    order.placedAt
  );

  if (file) {
    fd.append(
      "payment_screenshot",
      file,
      file.name
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body: fd
  });

  if (!res.ok) {
    throw new Error(
      `Email service returned ${res.status}`
    );
  }

  let data = {
    success: true
  };

  try {
    data = await res.json();
  } catch {}

  if (data.success === false) {
    throw new Error(
      "Email service rejected order"
    );
  }

  return data;
}


function togglePaymentUI() {
  const method =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value;

  document.querySelectorAll(".radio-option").forEach(x => {
    x.classList.toggle(
      "selected",
      x.querySelector("input").checked
    );
  });

  const crypto = method === "Crypto";

  document.getElementById(
    "crypto-payment-box"
  ).hidden = !crypto;

  document.getElementById(
    "flutterwave-note"
  ).hidden = crypto;

  document.getElementById(
    "place-order-btn"
  ).innerHTML = crypto
    ? 'Submit Payment Proof <span>→</span>'
    : 'Continue to Secure Payment <span>→</span>';
}


/*
 * Opens Flutterwave's secure checkout.
 */
function openFlutterwaveCheckout(order) {
  return new Promise((resolve, reject) => {

    if (
      !window.FlutterwaveCheckout
    ) {
      reject(
        new Error(
          "Flutterwave checkout is unavailable. Please refresh the page and try again."
        )
      );

      return;
    }

    if (
      !FLUTTERWAVE_PUBLIC_KEY ||
      FLUTTERWAVE_PUBLIC_KEY.includes("YOUR_FLUTTERWAVE")
    ) {
      reject(
        new Error(
          "Add your Flutterwave public key in script.js first."
        )
      );

      return;
    }

    let completed = false;

    const payment = FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,

      tx_ref: order.orderNumber,

      amount: Number(order.total),

      currency: "USD",

      payment_options:
        "card,banktransfer",

      customer: {
        email: order.email,
        phone_number: order.phone,
        name: order.fullName
      },

      customizations: {
        title: "Luxurie",
        description:
          `Payment for Luxurie order ${order.orderNumber}`,
        logo: ""
      },

      meta: [
        {
          metaname: "order_number",
          metavalue: order.orderNumber
        }
      ],

      callback: function(response) {
        if (completed) return;

        completed = true;

        if (
          response.status !== "successful" ||
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

      onclose: function() {
        if (!completed) {
          reject(
            new Error(
              "Payment was cancelled."
            )
          );
        }
      }
    });

    return payment;
  });
}


async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (state.submitting) return;

  const form = e.target;

  const error =
    document.getElementById("submit-error");

  error.hidden = true;

  if (!state.cart.length) {
    navigateTo("cart");
    return;
  }

  if (!validate(form)) {
    return;
  }

  const items = state.cart.map(i => {
    const p = findProduct(i.id);

    return {
      name: p.name,
      qty: i.qty,
      price: p.price,
      lineSubtotal: p.price * i.qty
    };
  });

  const subtotal = cartSubtotal();

  const payment =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;

  const order = {
    orderNumber: generateOrderNumber(),

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

    paymentMethod: payment,

    paymentReference: "",

    paymentStatus:
      payment === "Crypto"
        ? "Awaiting manual verification"
        : "Pending",

    items,

    subtotal,

    deliveryFee: DELIVERY_FEE,

    total:
      subtotal + DELIVERY_FEE,

    placedAt:
      new Date().toLocaleString(
        "en-US",
        {
          timeZone: "America/New_York"
        }
      )
  };

  const btn =
    document.getElementById(
      "place-order-btn"
    );

  state.submitting = true;

  btn.disabled = true;

  btn.textContent =
    payment === "Crypto"
      ? "Submitting proof…"
      : "Opening secure payment…";


  try {

    /*
     * FLUTTERWAVE PAYMENT
     */
    if (payment === "Flutterwave") {

      const response =
        await openFlutterwaveCheckout(order);

      btn.textContent =
        "Verifying payment…";

      await verifyFlutterwave(
        response.transaction_id,
        response.tx_ref || order.orderNumber,
        order.total
      );

      order.paymentReference =
        String(
          response.transaction_id
        );

      order.paymentStatus =
        "Paid";

      await submitOrder(
        order,
        null
      );

      document.getElementById(
        "confirmation-order-number"
      ).textContent =
        order.orderNumber;

      state.cart = [];

      renderCart();

      form.reset();

      togglePaymentUI();

      navigateTo("confirmation");

      return;
    }


    /*
     * CRYPTO PAYMENT
     */
    if (payment === "Crypto") {

      const file =
        document
          .getElementById(
            "payment-screenshot"
          )
          .files[0];

      order.paymentReference =
        document
          .getElementById(
            "payment-reference"
          )
          .value
          .trim();

      await submitOrder(
        order,
        file
      );

      document.getElementById(
        "confirmation-order-number"
      ).textContent =
        order.orderNumber;

      state.cart = [];

      renderCart();

      form.reset();

      togglePaymentUI();

      navigateTo("confirmation");
    }

  } catch (err) {

    console.error(err);

    error.hidden = false;

    error.textContent =
      err.message ||
      "We couldn't complete your order right now. Please try again; your cart has been kept.";

  } finally {

    state.submitting = false;

    btn.disabled = false;

    togglePaymentUI();
  }
}


function init() {

  document.getElementById(
    "crypto-wallet-address"
  ).textContent =
    CRYPTO_WALLET_ADDRESS;

  renderProductGrids();

  renderCart();

  document.body.addEventListener(
    "click",
    e => {

      const nav =
        e.target.closest(
          "[data-nav]"
        );

      if (nav) {
        e.preventDefault();

        navigateTo(
          nav.dataset.nav
        );

        return;
      }


      const add =
        e.target.closest(
          "[data-add]"
        );

      if (add) {

        addToCart(
          add.dataset.add
        );

        const t =
          add.textContent;

        add.textContent =
          "Added ✓";

        add.classList.add(
          "added"
        );

        setTimeout(() => {
          add.textContent = t;
          add.classList.remove(
            "added"
          );
        }, 900);

        return;
      }


      const inc =
        e.target.closest(
          "[data-qty-increase]"
        );

      if (inc) {
        return increaseQty(
          inc.dataset.qtyIncrease
        );
      }


      const dec =
        e.target.closest(
          "[data-qty-decrease]"
        );

      if (dec) {
        return decreaseQty(
          dec.dataset.qtyDecrease
        );
      }


      const rem =
        e.target.closest(
          "[data-remove]"
        );

      if (rem) {
        return removeFromCart(
          rem.dataset.remove
        );
      }


      if (
        e.target.closest(
          "#cart-btn"
        )
      ) {
        navigateTo("cart");
      }


      if (
        e.target.closest(
          "#menu-toggle"
        )
      ) {

        const nav =
          document.getElementById(
            "main-nav"
          );

        const btn =
          document.getElementById(
            "menu-toggle"
          );

        nav.classList.toggle(
          "open"
        );

        btn.setAttribute(
          "aria-expanded",
          nav.classList.contains(
            "open"
          )
        );
      }
    }
  );


  document
    .getElementById(
      "checkout-form"
    )
    .addEventListener(
      "submit",
      handleCheckoutSubmit
    );


  document
    .querySelectorAll(
      'input[name="paymentMethod"]'
    )
    .forEach(r =>
      r.addEventListener(
        "change",
        togglePaymentUI
      )
    );


  togglePaymentUI();

  const initial =
    location.hash.replace(
      "#",
      ""
    );

  navigateTo(
    document.getElementById(initial)
      ? initial
      : "home"
  );
}


document.addEventListener(
  "DOMContentLoaded",
  init
);
