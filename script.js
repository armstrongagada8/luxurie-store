const ORDER_EMAIL = "shopatluxurie@gmail.com";
const DELIVERY_FEE = 0;

// Flutterwave PUBLIC key only.
// Do NOT put your secret key here.
const FLUTTERWAVE_PUBLIC_KEY = "YOUR_FLUTTERWAVE_PUBLIC_KEY";

const CRYPTO_WALLET_ADDRESS =
  "0xB7eee0CE50092919E7Aec0Cfb3ABD279052b7A96";

const products = [
  {
    id: 1,
    name: "Wireless Earbuds",
    price: 39,
    image: "images/wireless-earbuds.svg"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 79,
    image: "images/smart-watch.svg"
  },
  {
    id: 3,
    name: "Premium Water Bottle",
    price: 24,
    image: "images/premium-water-bottle.svg"
  },
  {
    id: 4,
    name: "Minimalist Backpack",
    price: 59,
    image: "images/minimalist-backpack.svg"
  },
  {
    id: 5,
    name: "Classic Sunglasses",
    price: 34,
    image: "images/classic-sunglasses.svg"
  },
  {
    id: 6,
    name: "Portable Speaker",
    price: 49,
    image: "images/portable-speaker.svg"
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
  }).format(Number(amount) || 0);
}

function findProduct(id) {
  return products.find(product => Number(product.id) === Number(id));
}

function getCartCount() {
  return state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

function getCartSubtotal() {
  return state.cart.reduce((total, item) => {
    const product = findProduct(item.id);

    if (!product) return total;

    return total + product.price * item.quantity;
  }, 0);
}

function getCartTotal() {
  return getCartSubtotal() + DELIVERY_FEE;
}

function updateCartCount() {
  const elements = document.querySelectorAll(
    "#cart-count, .cart-count"
  );

  elements.forEach(element => {
    element.textContent = getCartCount();
  });
}

function addToCart(productId) {
  const product = findProduct(productId);

  if (!product) return;

  const existing = state.cart.find(
    item => Number(item.id) === Number(productId)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      quantity: 1
    });
  }

  renderCart();
  updateCartCount();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(
    item => Number(item.id) !== Number(productId)
  );

  renderCart();
  updateCartCount();
}

function changeQuantity(productId, change) {
  const item = state.cart.find(
    cartItem => Number(cartItem.id) === Number(productId)
  );

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  renderCart();
  updateCartCount();
}

function renderCart() {
  const cartContainer = document.querySelector("#cart-items");
  const subtotalElement = document.querySelector("#cart-subtotal");
  const deliveryElement = document.querySelector("#cart-delivery");
  const totalElement = document.querySelector("#cart-total");

  if (!cartContainer) return;

  if (state.cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
      </div>
    `;

    if (subtotalElement) {
      subtotalElement.textContent = formatUSD(0);
    }

    if (deliveryElement) {
      deliveryElement.textContent = formatUSD(DELIVERY_FEE);
    }

    if (totalElement) {
      totalElement.textContent = formatUSD(DELIVERY_FEE);
    }

    updateCartCount();
    return;
  }

  cartContainer.innerHTML = state.cart
    .map(item => {
      const product = findProduct(item.id);

      if (!product) return "";

      const itemTotal = product.price * item.quantity;

      return `
        <div class="cart-item">
          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div class="cart-item-info">
            <h3>${product.name}</h3>
            <p>${formatUSD(product.price)}</p>

            <div class="quantity-controls">
              <button
                type="button"
                onclick="changeQuantity(${product.id}, -1)"
              >
                −
              </button>

              <span>${item.quantity}</span>

              <button
                type="button"
                onclick="changeQuantity(${product.id}, 1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="cart-item-right">
            <strong>${formatUSD(itemTotal)}</strong>

            <button
              type="button"
              class="remove-item"
              onclick="removeFromCart(${product.id})"
            >
              Remove
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  if (subtotalElement) {
    subtotalElement.textContent =
      formatUSD(getCartSubtotal());
  }

  if (deliveryElement) {
    deliveryElement.textContent =
      formatUSD(DELIVERY_FEE);
  }

  if (totalElement) {
    totalElement.textContent =
      formatUSD(getCartTotal());
  }

  updateCartCount();
}

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "cart") {
    renderCart();
  }
}

function goToShop() {
  showPage("shop");
}

function goToCart() {
  showPage("cart");
}

function goToCheckout() {
  if (state.cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  showPage("checkout");
}

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `LUX-${timestamp}-${random}`;
}

function getSelectedPaymentMethod() {
  const selected = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );

  return selected ? selected.value : "Flutterwave";
}

function updatePaymentUI() {
  const method = getSelectedPaymentMethod();

  const cryptoBox = document.querySelector(
    "#crypto-payment-box"
  );

  const flutterwaveNote = document.querySelector(
    "#flutterwave-note"
  );

  if (cryptoBox) {
    cryptoBox.style.display =
      method === "Crypto" ? "block" : "none";
  }

  if (flutterwaveNote) {
    flutterwaveNote.style.display =
      method === "Flutterwave" ? "block" : "none";
  }

  document
    .querySelectorAll(".radio-option")
    .forEach(option => {
      const input = option.querySelector(
        'input[name="paymentMethod"]'
      );

      option.classList.toggle(
        "selected",
        input && input.checked
      );
    });
}

function validateCheckoutForm() {
  const form = document.querySelector("#checkout-form");

  if (!form) {
    throw new Error("Checkout form could not be found.");
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  return true;
}

function getFormValue(id) {
  const element = document.getElementById(id);

  return element ? element.value.trim() : "";
}

function buildOrder() {
  const fullName = getFormValue("full-name");
  const email = getFormValue("email");
  const phone = getFormValue("phone");
  const address = getFormValue("address");
  const city = getFormValue("city");
  const stateValue = getFormValue("state");
  const zip = getFormValue("zip");
  const country = getFormValue("country");

  return {
    orderNumber: generateOrderNumber(),
    fullName,
    email,
    phone,
    address,
    city,
    state: stateValue,
    zip,
    country,
    items: state.cart.map(item => {
      const product = findProduct(item.id);

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: product.price * item.quantity
      };
    }),
    subtotal: getCartSubtotal(),
    deliveryFee: DELIVERY_FEE,
    total: getCartTotal(),
    paymentMethod: getSelectedPaymentMethod(),
    paymentStatus: "Pending",
    paymentReference: ""
  };
}

function buildOrderText(order) {
  const itemLines = order.items
    .map(item => {
      return `${item.name} x ${item.quantity} - ${formatUSD(
        item.total
      )}`;
    })
    .join("\n");

  return `
LUXURIE ORDER

Order Number: ${order.orderNumber}

CUSTOMER
Name: ${order.fullName}
Email: ${order.email}
Phone: ${order.phone}

DELIVERY ADDRESS
${order.address}
${order.city}, ${order.state} ${order.zip}
${order.country}

ORDER ITEMS
${itemLines}

Subtotal: ${formatUSD(order.subtotal)}
Delivery: ${formatUSD(order.deliveryFee)}
Total: ${formatUSD(order.total)}

PAYMENT
Method: ${order.paymentMethod}
Status: ${order.paymentStatus}
Reference: ${order.paymentReference || "N/A"}
  `.trim();
}

async function submitOrder(order) {
  const subject =
    `Luxurie Order ${order.orderNumber}`;

  const body = buildOrderText(order);

  const response = await fetch(
    "https://formsubmit.co/ajax/" + ORDER_EMAIL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "box",
        message: body
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Your order could not be submitted. Please try again."
    );
  }

  return response;
}

/*
|--------------------------------------------------------------------------
| FLUTTERWAVE PAYMENT VERIFICATION
|--------------------------------------------------------------------------
*/

async function verifyFlutterwave(
  transactionId,
  reference,
  expectedAmount
) {
  const response = await fetch(
    "/api/verify-payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        reference: reference,
        amount: Number(expectedAmount),
        currency: "USD"
      })
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.verified) {
    throw new Error(
      data.message ||
        "Flutterwave payment could not be verified."
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| FLUTTERWAVE CHECKOUT
|--------------------------------------------------------------------------
*/

function openFlutterwaveCheckout(order) {
  return new Promise((resolve, reject) => {
    if (!window.FlutterwaveCheckout) {
      reject(
        new Error(
          "Flutterwave checkout is unavailable. Please refresh the page and try again."
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

    const payment = FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,

      tx_ref: order.orderNumber,

      amount: Number(order.total),

      currency: "USD",

      /*
       * Payment methods enabled for your account.
       *
       * card:
       * Local + International Cards
       *
       * banktransfer:
       * Bank Transfer
       *
       * ussd:
       * USSD
       *
       * applepay:
       * Apple Pay
       */
      payment_options:
        "card,banktransfer,ussd,applepay",

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

      callback: function (response) {
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

      onclose: function () {
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

/*
|--------------------------------------------------------------------------
| CRYPTO PAYMENT
|--------------------------------------------------------------------------
*/

function setupCryptoWallet() {
  const walletElement = document.querySelector(
    "#crypto-wallet-address"
  );

  if (walletElement) {
    walletElement.textContent =
      CRYPTO_WALLET_ADDRESS;
  }
}

function getCryptoReference() {
  return getFormValue("payment-reference");
}

function getCryptoScreenshot() {
  const input = document.querySelector(
    "#payment-screenshot"
  );

  if (!input || !input.files || !input.files[0]) {
    return null;
  }

  return input.files[0];
}

/*
|--------------------------------------------------------------------------
| CHECKOUT SUBMISSION
|--------------------------------------------------------------------------
*/

async function handleCheckoutSubmit(event) {
  event.preventDefault();

  if (state.submitting) {
    return;
  }

  if (!validateCheckoutForm()) {
    return;
  }

  if (state.cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const order = buildOrder();

  state.submitting = true;
  state.paymentPending = true;

  const button = document.querySelector(
    "#place-order-btn"
  );

  const originalButtonText =
    button ? button.textContent : "";

  if (button) {
    button.disabled = true;
    button.textContent = "Processing...";
  }

  try {
    /*
     * ---------------------------------------------------------
     * FLUTTERWAVE
     * ---------------------------------------------------------
     */

    if (order.paymentMethod === "Flutterwave") {
      if (button) {
        button.textContent =
          "Opening secure payment...";
      }

      const paymentResponse =
        await openFlutterwaveCheckout(order);

      if (
        !paymentResponse ||
        !paymentResponse.transaction_id
      ) {
        throw new Error(
          "Flutterwave did not return a valid transaction."
        );
      }

      if (button) {
        button.textContent =
          "Verifying payment...";
      }

      const verification =
        await verifyFlutterwave(
          paymentResponse.transaction_id,
          order.orderNumber,
          order.total
        );

      order.paymentStatus = "Paid";

      order.paymentReference =
        verification.transaction_id ||
        paymentResponse.transaction_id;

      await submitOrder(order);

      state.cart = [];

      renderCart();
      updateCartCount();

      state.paymentPending = false;

      showPage("confirmation");

      return;
    }

    /*
     * ---------------------------------------------------------
     * CRYPTO
     * ---------------------------------------------------------
     */

    if (order.paymentMethod === "Crypto") {
      const reference = getCryptoReference();
      const screenshot = getCryptoScreenshot();

      if (!reference) {
        throw new Error(
          "Please enter your crypto payment reference."
        );
      }

      if (!screenshot) {
        throw new Error(
          "Please upload your crypto payment screenshot."
        );
      }

      order.paymentStatus =
        "Awaiting manual verification";

      order.paymentReference = reference;

      await submitOrder(order);

      state.cart = [];

      renderCart();
      updateCartCount();

      state.paymentPending = false;

      showPage("confirmation");

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

    alert(
      error.message ||
        "Something went wrong while processing your order."
    );

  } finally {
    state.submitting = false;
    state.paymentPending = false;

    if (button) {
      button.disabled = false;
      button.textContent =
        originalButtonText ||
        "Place Order";
    }
  }
}

/*
|--------------------------------------------------------------------------
| EVENT LISTENERS
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  function () {
    renderCart();
    updateCartCount();
    setupCryptoWallet();
    updatePaymentUI();

    const checkoutForm =
      document.querySelector("#checkout-form");

    if (checkoutForm) {
      checkoutForm.addEventListener(
        "submit",
        handleCheckoutSubmit
      );
    }

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

    document
      .querySelectorAll(
        ".add-to-cart, [data-add-to-cart]"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          function () {
            const productId =
              this.dataset.productId ||
              this.dataset.addToCart;

            if (productId) {
              addToCart(productId);
            }
          }
        );
      });
  }
);

/*
|--------------------------------------------------------------------------
| MAKE FUNCTIONS AVAILABLE TO HTML onclick ATTRIBUTES
|--------------------------------------------------------------------------
*/

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;
window.goToShop = goToShop;
window.goToCart = goToCart;
window.goToCheckout = goToCheckout;
window.showPage = showPage;
