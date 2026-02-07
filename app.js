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
const spriteCache = new Map();
const spriteLoadPromises = new Map();

const DATA_PATHS = {
  itemNames: "SourceCodeAssets/Resources/NHSE/text/en/text_item_en.txt",
  itemKinds: "SourceCodeAssets/Resources/NHSE/byte/item_kind.bytes",
  spriteDump: "SourceCodeAssets/Resources/SpriteLoading/imagedump_menu.bytes",
  spriteHeader: "SourceCodeAssets/Resources/SpriteLoading/imagedump_menuheader.txt",
  spritePointer: "SourceCodeAssets/Resources/SpriteLoading/SpritePointer_menu.txt",
};

const ITEM_KIND_NAMES = [
  "Bottoms_Long",
  "Bottoms_Middle",
  "Bottoms_Short",
  "Ftr_1x1_Chair",
  "Ftr_1x1_Floor",
  "Ftr_2x1_Bed",
  "Ftr_2x1_Floor",
  "Ftr_2x2_Floor",
  "Kind_Accessory",
  "Kind_AutumnLeaf",
  "Kind_Axe",
  "Kind_Bag",
  "Kind_Balloon",
  "Kind_Basket",
  "Kind_BdayCupcake",
  "Kind_BigbagPresent",
  "Kind_BlowBubble",
  "Kind_BridgeItem",
  "Kind_Bromide",
  "Kind_Bush",
  "Kind_BushSeedling",
  "Kind_Candy",
  "Kind_Candyfloss",
  "Kind_Cap",
  "Kind_ChangeStick",
  "Kind_CliffMaker",
  "Kind_CommonFabricObject",
  "Kind_CommonFabricRug",
  "Kind_CommonFabricTexture",
  "Kind_CookingMaterial",
  "Kind_Counter",
  "Kind_CraftMaterial",
  "Kind_CraftPhoneCase",
  "Kind_CraftRemake",
  "Kind_Dishes",
  "Kind_DiveFish",
  "Kind_DIYRecipe",
  "Kind_DoorDeco",
  "Kind_DreamGold",
  "Kind_Drink",
  "Kind_DummyCardboard",
  "Kind_DummyDIYRecipe",
  "Kind_DummyFtr",
  "Kind_DummyHowtoBook",
  "Kind_DummyPresentbox",
  "Kind_DummyRecipe",
  "Kind_DummyWrapping",
  "Kind_DummyWrappingOtoshidama",
  "Kind_EasterEgg",
  "Kind_EventObjFtr",
  "Kind_Feather",
  "Kind_Fence",
  "Kind_FierworkHand",
  "Kind_FireworkM",
  "Kind_Fish",
  "Kind_FishBait",
  "Kind_FishingRod",
  "Kind_FishToy",
  "Kind_Flower",
  "Kind_FlowerBud",
  "Kind_FlowerSeed",
  "Kind_FlowerShower",
  "Kind_Fossil",
  "Kind_FossilUnknown",
  "Kind_Fruit",
  "Kind_Ftr",
  "Kind_FtrWall",
  "Kind_GardenEditList",
  "Kind_Giftbox",
  "Kind_GroundMaker",
  "Kind_Gyroid",
  "Kind_GyroidScrap",
  "Kind_HandBag",
  "Kind_HandheldPennant",
  "Kind_HarvestDish",
  "Kind_Helmet",
  "Kind_Honeycomb",
  "Kind_HousePost",
  "Kind_HousingKit",
  "Kind_HousingKitBirdge",
  "Kind_HousingKitRcoQuest",
  "Kind_Icecandy",
  "Kind_Insect",
  "Kind_InsectToy",
  "Kind_JohnnyQuest",
  "Kind_JohnnyQuestDust",
  "Kind_JuiceFuzzyapple",
  "Kind_Ladder",
  "Kind_Lantern",
  "Kind_LicenseItem",
  "Kind_LostQuest",
  "Kind_LostQuestDust",
  "Kind_LoveCrystal",
  "Kind_MaracasCarnival",
  "Kind_Medicine",
  "Kind_Megaphone",
  "Kind_MessageBottle",
  "Kind_MilePlaneTicket",
  "Kind_Money",
  "Kind_Mushroom",
  "Kind_Music",
  "Kind_MusicMiss",
  "Kind_MyDesignObject",
  "Kind_MyDesignTexture",
  "Kind_Net",
  "Kind_NnpcRoomMarker",
  "Kind_NpcOutfit",
  "Kind_Ocarina",
  "Kind_OneRoomBox",
  "Kind_Ore",
  "Kind_Otoshidama",
  "Kind_Panflute",
  "Kind_Partyhorn",
  "Kind_PartyPopper",
  "Kind_PhotoStudioList",
  "Kind_Picture",
  "Kind_PictureFake",
  "Kind_Pillar",
  "Kind_PinataStick",
  "Kind_PirateQuest",
  "Kind_PitFallSeed",
  "Kind_PlayerDemoOutfit",
  "Kind_Poster",
  "Kind_QuestChristmasPresentbox",
  "Kind_QuestWrapping",
  "Kind_RainbowFeather",
  "Kind_RiverMaker",
  "Kind_RollanTicket",
  "Kind_RoomFloor",
  "Kind_RoomWall",
  "Kind_Rug",
  "Kind_RugMyDesign",
  "Kind_Sakurapetal",
  "Kind_Sculpture",
  "Kind_SculptureFake",
  "Kind_SequenceOnly",
  "Kind_SettingLadder",
  "Kind_ShellDrift",
  "Kind_ShellFish",
  "Kind_Shoes",
  "Kind_ShopTorso",
  "Kind_Shovel",
  "Kind_SincerityTowel",
  "Kind_Slingshot",
  "Kind_SlopeItem",
  "Kind_SmartPhone",
  "Kind_SnowCrystal",
  "Kind_Socks",
  "Kind_SouvenirChocolate",
  "Kind_SoySet",
  "Kind_SpeakerMegaphone",
  "Kind_StarPiece",
  "Kind_StickLight",
  "Kind_StickLightColorful",
  "Kind_SubToolCan",
  "Kind_SubToolDonut",
  "Kind_SubToolEat",
  "Kind_SubToolEatDrop",
  "Kind_SubToolEatRemakeable",
  "Kind_SubToolGeneric",
  "Kind_SubToolIcecream",
  "Kind_SubToolIcesoft",
  "Kind_SubToolRemakeable",
  "Kind_SubToolSensu",
  "Kind_TailorTicket",
  "Kind_Tambourine",
  "Kind_Tapioca",
  "Kind_Timer",
  "Kind_Transceiver",
  "Kind_Trash",
  "Kind_TreasureQuest",
  "Kind_TreasureQuestDust",
  "Kind_Tree",
  "Kind_TreeSeedling",
  "Kind_Turnip",
  "Kind_TurnipExpired",
  "Kind_Uchiwa",
  "Kind_Umbrella",
  "Kind_VegeSeedling",
  "Kind_Vegetable",
  "Kind_VegeTree",
  "Kind_Vine",
  "Kind_Watering",
  "Kind_Weed",
  "Kind_WeedLight",
  "Kind_Windmill",
  "Kind_WoodenStickTool",
  "Kind_WrappingPaper",
  "Kind_XmasDeco",
  "Kind_YutaroWisp",
  "Onepiece_Dress",
  "Onepiece_Long",
  "Onepiece_Middle",
  "Onepiece_Short",
  "Shoes_Boots",
  "Shoes_Pumps",
  "Top_Long",
  "Top_Middle",
  "Top_Short",
  "UnitIcon_FlwAnemone",
  "UnitIcon_FlwCosmos",
  "UnitIcon_FlwHyacinth",
  "UnitIcon_FlwLily",
  "UnitIcon_FlwMum",
  "UnitIcon_FlwPansy",
  "UnitIcon_FlwRose",
  "UnitIcon_FlwTulip",
];

let spriteDumpBytes = null;
let spriteHeaderMap = null;
let spritePointerMap = null;

const DEFAULT_SPRITE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" fill="#eef2f7"/>
      <path d="M24 62l12-14 10 12 14-18 12 20z" fill="#cbd5e1"/>
      <circle cx="34" cy="34" r="8" fill="#cbd5e1"/>
    </svg>`
  );

const createSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const formatKindName = (kindName) =>
  kindName
    .replace(/^Kind_/, "")
    .replace(/^Ftr_/, "Furniture ")
    .replace(/_/g, " ");

const buildDisplayNames = (rawNames) => {
  const names = [...rawNames];
  if (names.length > 0) {
    names[0] = "";
  }
  const seen = new Set();
  return names.map((name, index) => {
    const cleaned = name.trim();
    if (!cleaned) {
      return `(Item #${String(index).padStart(3, "0")})`;
    }
    if (seen.has(cleaned)) {
      return `${cleaned} (#${String(index).padStart(3, "0")})`;
    }
    seen.add(cleaned);
    return cleaned;
  });
};

const parseHeaderMap = (text) => {
  const map = new Map();
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) {
      return;
    }
    const [key, start, end] = line.split(",");
    if (!key || !start || !end) {
      return;
    }
    map.set(key.trim(), {
      start: parseInt(start, 16),
      end: parseInt(end, 16),
    });
  });
  return map;
};

const parsePointerMap = (text) => {
  const map = new Map();
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) {
      return;
    }
    const [key, value] = line.split(",");
    if (!key || !value) {
      return;
    }
    map.set(key.trim(), value.trim());
  });
  return map;
};

const loadSpriteAssets = async () => {
  const [dumpResponse, headerResponse, pointerResponse] = await Promise.all([
    fetch(DATA_PATHS.spriteDump),
    fetch(DATA_PATHS.spriteHeader),
    fetch(DATA_PATHS.spritePointer),
  ]);
  spriteDumpBytes = new Uint8Array(await dumpResponse.arrayBuffer());
  spriteHeaderMap = parseHeaderMap(await headerResponse.text());
  spritePointerMap = parsePointerMap(await pointerResponse.text());
};

const getSpriteUrl = async (itemId) => {
  if (!spriteDumpBytes || !spriteHeaderMap || !spritePointerMap) {
    return null;
  }
  const idHex = itemId.toString(16).toUpperCase();
  const spriteKey = spritePointerMap.get(idHex);
  if (!spriteKey) {
    return null;
  }
  const range = spriteHeaderMap.get(spriteKey);
  if (!range) {
    return null;
  }
  const slice = spriteDumpBytes.slice(range.start, range.end);
  if (slice.length === 0) {
    return null;
  }
  return URL.createObjectURL(new Blob([slice], { type: "image/png" }));
};

const assignSprite = (image, itemId) => {
  if (spriteCache.has(itemId)) {
    const cached = spriteCache.get(itemId);
    image.src = cached || DEFAULT_SPRITE;
    return;
  }

  image.src = DEFAULT_SPRITE;
  if (!spriteLoadPromises.has(itemId)) {
    const promise = getSpriteUrl(itemId)
      .then((url) => {
        spriteCache.set(itemId, url);
        spriteLoadPromises.delete(itemId);
        return url;
      })
      .catch(() => {
        spriteCache.set(itemId, null);
        spriteLoadPromises.delete(itemId);
        return null;
      });
    spriteLoadPromises.set(itemId, promise);
  }

  spriteLoadPromises.get(itemId).then((url) => {
    if (url) {
      image.src = url;
    }
  });
};

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
    assignSprite(image, item.id);

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
    assignSprite(image, item.id);

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

const loadCatalogItems = async () => {
  const [itemNameResponse, itemKindResponse] = await Promise.all([
    fetch(DATA_PATHS.itemNames),
    fetch(DATA_PATHS.itemKinds),
  ]);
  const rawNames = (await itemNameResponse.text()).split(/\r?\n/);
  const kinds = new Uint8Array(await itemKindResponse.arrayBuffer());
  const normalizedNames =
    rawNames.length >= kinds.length
      ? rawNames.slice(0, kinds.length)
      : [...rawNames, ...Array(kinds.length - rawNames.length).fill("")];
  const displayNames = buildDisplayNames(normalizedNames);

  return displayNames.map((name, index) => {
    const kindIndex = kinds[index];
    const kindName =
      kindIndex !== undefined && ITEM_KIND_NAMES[kindIndex]
        ? formatKindName(ITEM_KIND_NAMES[kindIndex])
        : "Unknown";
    return {
      id: index,
      name,
      category: kindName,
      variant: "",
    };
  });
};

const init = async () => {
  await loadSpriteAssets();
  catalogItems = await loadCatalogItems();
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
