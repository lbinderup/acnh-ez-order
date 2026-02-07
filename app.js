const catalogList = document.getElementById("catalog-list");
const orderSlots = document.getElementById("order-slots");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const clearSearchButton = document.getElementById("clear-search");
const clearOrderButton = document.getElementById("clear-order");
const copyOrderButton = document.getElementById("copy-order");
const orderCommand = document.getElementById("order-command");
const copyCommandButton = document.getElementById("copy-command");
const slotCount = document.getElementById("slot-count");

const MAX_SLOTS = 40;
let catalogItems = [];
let filteredItems = [];
const orderItems = [];

const createSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const renderCatalog = () => {
  catalogList.innerHTML = "";
  if (filteredItems.length === 0) {
    catalogList.innerHTML = "<p>No items match your search.</p>";
    return;
  }

  filteredItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "catalog-card";

    const image = document.createElement("img");
    image.alt = item.name;
    image.src = item.sprite;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "catalog-meta";
    meta.textContent = `${item.category} · ${item.variant || "Default"}`;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add to order";
    button.disabled = orderItems.length >= MAX_SLOTS;
    button.addEventListener("click", () => addToOrder(item));

    card.append(image, title, meta, button);
    catalogList.appendChild(card);
  });
};

const renderOrder = () => {
  orderSlots.innerHTML = "";
  slotCount.textContent = orderItems.length.toString();

  if (orderItems.length === 0) {
    orderSlots.innerHTML = "<p>No items in your order yet.</p>";
  }

  orderItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "order-card";

    const image = document.createElement("img");
    image.alt = item.name;
    image.src = item.sprite;

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${item.name}`;

    const meta = document.createElement("div");
    meta.className = "catalog-meta";
    meta.textContent = `${item.category} · ${item.variant || "Default"}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Remove";
    button.addEventListener("click", () => removeFromOrder(index));

    card.append(image, title, meta, button);
    orderSlots.appendChild(card);
  });

  updateOrderCommand();
};

const updateOrderCommand = () => {
  if (orderItems.length === 0) {
    orderCommand.textContent = "$order";
    copyOrderButton.disabled = true;
    copyCommandButton.disabled = true;
    return;
  }

  const orderNames = orderItems.map((item) => item.commandName || createSlug(item.name));
  orderCommand.textContent = `$order ${orderNames.join(" ")}`;
  copyOrderButton.disabled = false;
  copyCommandButton.disabled = false;
};

const addToOrder = (item) => {
  if (orderItems.length >= MAX_SLOTS) {
    return;
  }
  orderItems.push(item);
  renderOrder();
  renderCatalog();
};

const removeFromOrder = (index) => {
  orderItems.splice(index, 1);
  renderOrder();
  renderCatalog();
};

const filterCatalog = () => {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  filteredItems = catalogItems.filter((item) => {
    const matchesCategory = !category || item.category === category;
    const searchable = `${item.name} ${item.category} ${item.variant || ""}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesCategory && matchesQuery;
  });

  renderCatalog();
};

const populateCategories = () => {
  const categories = Array.from(new Set(catalogItems.map((item) => item.category))).sort();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    window.alert("Unable to copy. Please copy manually.");
  }
};

const init = async () => {
  const response = await fetch("data/items.json");
  catalogItems = await response.json();
  filteredItems = [...catalogItems];
  populateCategories();
  renderCatalog();
  renderOrder();
};

searchInput.addEventListener("input", filterCatalog);
categoryFilter.addEventListener("change", filterCatalog);
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  filterCatalog();
});

clearOrderButton.addEventListener("click", () => {
  orderItems.length = 0;
  renderOrder();
  renderCatalog();
});

copyOrderButton.addEventListener("click", () => copyToClipboard(orderCommand.textContent));
copyCommandButton.addEventListener("click", () => copyToClipboard(orderCommand.textContent));

init();
