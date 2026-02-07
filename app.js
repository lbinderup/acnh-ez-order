const catalogList = document.getElementById("catalog-list");
const orderSlots = document.getElementById("order-slots");
const searchInput = document.getElementById("search-input");
const categoryToggles = document.getElementById("category-toggles");
const clearSearchButton = document.getElementById("clear-search");
const clearOrderButton = document.getElementById("clear-order");
const copyOrderButton = document.getElementById("copy-order");
const orderCommand = document.getElementById("order-command");
const copyCommandButton = document.getElementById("copy-command");
const slotCount = document.getElementById("slot-count");

const MAX_SLOTS = 40;
const MAX_PREVIEW_RESULTS = 8;
const DEFAULT_SUPER_CATEGORY = "Furniture";
let catalogItems = [];
let filteredItems = [];
const orderItems = [];
const spriteCache = new Map();
const spriteLoadPromises = new Map();
const unitIconCache = new Map();
const unitIconLoadPromises = new Map();
const spriteVariantMap = new Map();

const DATA_PATHS = {
  itemNames: "data/nhse/text_item_en.txt",
  itemKinds: "data/nhse/item_kind.bytes",
  unitIconDump: "data/unit-icons/imagedump_manual.bytes",
  unitIconHeader: "data/unit-icons/imagedump_manualheader.txt",
  unitIconPointer: "data/unit-icons/BeriPointer_unit.txt",
  spriteMap: "resources/sprite-map.json",
};

const SPRITE_BASE_PATH = "resources/sprites";

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

let unitIconDumpBytes = null;
let unitIconHeaderMap = null;
let unitIconPointerMap = null;
let isSearchEmpty = true;
const activeCategories = new Set([DEFAULT_SUPER_CATEGORY]);

const DEFAULT_SPRITE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" fill="#eef2f7"/>
      <path d="M24 62l12-14 10 12 14-18 12 20z" fill="#cbd5e1"/>
      <circle cx="34" cy="34" r="8" fill="#cbd5e1"/>
    </svg>`
  );

const formatKindName = (kindName) =>
  kindName
    .replace(/^Kind_/, "")
    .replace(/^Ftr_/, "Furniture ")
    .replace(/_/g, " ");

const matchesAny = (source, tokens) => tokens.some((token) => source.includes(token));

const getSuperCategory = (kindName) => {
  if (!kindName) {
    return "Misc";
  }
  if (
    kindName.startsWith("Ftr_") ||
    kindName.startsWith("Kind_Ftr") ||
    matchesAny(kindName, [
      "Kind_Room",
      "Kind_Rug",
      "Kind_Wall",
      "Kind_Floor",
      "Kind_Pillar",
      "Kind_Picture",
      "Kind_Poster",
      "Kind_Sculpture",
      "Kind_DoorDeco",
      "Kind_Fence",
      "Kind_BridgeItem",
      "Kind_SlopeItem",
      "Kind_HousePost",
      "Kind_HousingKit",
      "Kind_HousingKitBirdge",
      "Kind_GardenEditList",
      "Kind_MyDesignObject",
      "Kind_MyDesignTexture",
      "Kind_CommonFabric",
      "Kind_DummyFtr",
      "Kind_SequenceOnly",
      "Kind_OneRoomBox",
      "Kind_Counter",
      "Kind_DummyCardboard",
      "Kind_DummyPresentbox",
      "Kind_DummyWrapping",
      "Kind_DummyWrappingOtoshidama",
    ])
  ) {
    return "Furniture";
  }
  if (
    matchesAny(kindName, [
      "Bottoms_",
      "Top_",
      "Onepiece_",
      "Shoes_",
      "Kind_Cap",
      "Kind_Shoes",
      "Kind_Socks",
      "Kind_Helmet",
      "Kind_Accessory",
      "Kind_Bag",
      "Kind_HandBag",
      "Kind_ShopTorso",
      "Kind_PlayerDemoOutfit",
      "Kind_NpcOutfit",
    ])
  ) {
    return "Clothing";
  }
  if (
    matchesAny(kindName, [
      "Kind_Axe",
      "Kind_Net",
      "Kind_Shovel",
      "Kind_Ladder",
      "Kind_FishingRod",
      "Kind_Slingshot",
      "Kind_Megaphone",
      "Kind_Ocarina",
      "Kind_Panflute",
      "Kind_Maracas",
      "Kind_Tambourine",
      "Kind_Partyhorn",
      "Kind_PartyPopper",
      "Kind_BlowBubble",
      "Kind_SubTool",
      "Kind_SmartPhone",
    ])
  ) {
    return "Tools";
  }
  if (
    matchesAny(kindName, [
      "Kind_Fish",
      "Kind_Insect",
      "Kind_DiveFish",
      "Kind_Fossil",
      "Kind_Gyroid",
      "Kind_Flower",
      "Kind_Fruit",
      "Kind_Mushroom",
      "Kind_Bush",
    ])
  ) {
    return "Nature";
  }
  if (
    matchesAny(kindName, [
      "Kind_CraftMaterial",
      "Kind_CraftRemake",
      "Kind_CookingMaterial",
      "Kind_Ore",
      "Kind_StarPiece",
      "Kind_SnowCrystal",
      "Kind_Feather",
      "Kind_Shell",
      "Kind_Clay",
      "Kind_Stone",
      "Kind_Wood",
      "Kind_Candy",
      "Kind_Candyfloss",
      "Kind_Honeycomb",
    ])
  ) {
    return "Materials";
  }
  return "Misc";
};

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

const loadUnitIconAssets = async () => {
  const [dumpResponse, headerResponse, pointerResponse] = await Promise.all([
    fetch(DATA_PATHS.unitIconDump),
    fetch(DATA_PATHS.unitIconHeader),
    fetch(DATA_PATHS.unitIconPointer),
  ]);
  unitIconDumpBytes = new Uint8Array(await dumpResponse.arrayBuffer());
  unitIconHeaderMap = parseHeaderMap(await headerResponse.text());
  unitIconPointerMap = parsePointerMap(await pointerResponse.text());
};

const getUnitIconUrl = async (kindIndex) => {
  if (!unitIconDumpBytes || !unitIconHeaderMap || !unitIconPointerMap) {
    return null;
  }
  const kindHex = kindIndex.toString(16).toUpperCase();
  const spriteKey = unitIconPointerMap.get(kindHex);
  if (!spriteKey) {
    return null;
  }
  const range = unitIconHeaderMap.get(spriteKey);
  if (!range) {
    return null;
  }
  const slice = unitIconDumpBytes.slice(range.start, range.end);
  if (slice.length === 0) {
    return null;
  }
  return URL.createObjectURL(new Blob([slice], { type: "image/png" }));
};

const formatItemHexId = (itemId) => itemId.toString(16).toUpperCase();

const buildSpriteCandidates = (hexId, variantIndex) => {
  const candidates = [];
  if (variantIndex !== null && variantIndex !== undefined) {
    candidates.push(`${SPRITE_BASE_PATH}/${hexId}_${variantIndex}.png`);
  }
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}.png`);
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}_0.png`);
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}_0_0.png`);
  return candidates;
};

const resolveSpriteUrl = (hexId, variantIndex) =>
  new Promise((resolve) => {
    const candidates = buildSpriteCandidates(hexId, variantIndex);
    const attempt = (index) => {
      if (index >= candidates.length) {
        resolve(null);
        return;
      }
      const probe = new Image();
      probe.onload = () => resolve(candidates[index]);
      probe.onerror = () => attempt(index + 1);
      probe.src = candidates[index];
    };
    attempt(0);
  });

const assignSprite = (image, hexId, variantIndex) => {
  const cacheKey =
    variantIndex !== null && variantIndex !== undefined
      ? `${hexId}_${variantIndex}`
      : hexId;
  if (spriteCache.has(cacheKey)) {
    const cached = spriteCache.get(cacheKey);
    image.src = cached || DEFAULT_SPRITE;
    return;
  }

  image.src = DEFAULT_SPRITE;
  if (!spriteLoadPromises.has(cacheKey)) {
    const promise = resolveSpriteUrl(hexId, variantIndex)
      .then((url) => {
        spriteCache.set(cacheKey, url);
        spriteLoadPromises.delete(cacheKey);
        return url;
      })
      .catch(() => {
        spriteCache.set(cacheKey, null);
        spriteLoadPromises.delete(cacheKey);
        return null;
      });
    spriteLoadPromises.set(cacheKey, promise);
  }

  spriteLoadPromises.get(cacheKey).then((url) => {
    if (url) {
      image.src = url;
    }
  });
};

const assignUnitIcon = (image, kindIndex) => {
  if (kindIndex === undefined || kindIndex === null) {
    image.hidden = true;
    return;
  }
  if (unitIconCache.has(kindIndex)) {
    const cached = unitIconCache.get(kindIndex);
    if (cached) {
      image.src = cached;
      image.hidden = false;
    } else {
      image.hidden = true;
    }
    return;
  }

  image.hidden = true;
  if (!unitIconLoadPromises.has(kindIndex)) {
    const promise = getUnitIconUrl(kindIndex)
      .then((url) => {
        unitIconCache.set(kindIndex, url);
        unitIconLoadPromises.delete(kindIndex);
        return url;
      })
      .catch(() => {
        unitIconCache.set(kindIndex, null);
        unitIconLoadPromises.delete(kindIndex);
        return null;
      });
    unitIconLoadPromises.set(kindIndex, promise);
  }

  unitIconLoadPromises.get(kindIndex).then((url) => {
    if (url) {
      image.src = url;
      image.hidden = false;
    }
  });
};

const buildSpriteFrame = (item, usePreview = true) => {
  const frame = document.createElement("div");
  frame.className = "sprite-frame";

  const image = document.createElement("img");
  image.className = "item-sprite";
  image.alt = item.name;
  if (usePreview) {
    assignSprite(image, item.hexId, item.selectedVariantIndex);
  } else {
    image.hidden = true;
  }

  const typeIcon = document.createElement("img");
  typeIcon.className = "type-icon";
  typeIcon.alt = "";
  typeIcon.setAttribute("aria-hidden", "true");
  assignUnitIcon(typeIcon, item.kindIndex);

  frame.append(image, typeIcon);
  return frame;
};

const buildOrderId = (hexId, variantIndex) => {
  if (variantIndex === null || variantIndex === undefined || variantIndex === 0) {
    return hexId;
  }
  return `${variantIndex}${hexId.padStart(8, "0")}`;
};

const getSelectedVariantIndex = (item) => {
  if (!item.variants || item.variants.length === 0) {
    return null;
  }
  if (item.selectedVariantIndex === null || item.selectedVariantIndex === undefined) {
    return item.variants[0].index;
  }
  return item.selectedVariantIndex;
};

const getVariantMetaLabel = (item) => {
  const variantIndex = getSelectedVariantIndex(item);
  if (variantIndex === null || variantIndex === undefined) {
    return "Default";
  }
  return `Variant ${variantIndex}`;
};

const buildVariantPicker = (item) => {
  if (!item.variants || item.variants.length <= 1) {
    return null;
  }
  const container = document.createElement("div");
  container.className = "variant-picker";

  item.variants.forEach((variant) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "variant-option";
    if (variant.index === getSelectedVariantIndex(item)) {
      button.classList.add("is-selected");
    }

    const image = document.createElement("img");
    image.className = "variant-sprite";
    image.alt = `${item.name} variant ${variant.index}`;
    assignSprite(image, item.hexId, variant.index);

    button.appendChild(image);
    button.addEventListener("click", () => {
      item.selectedVariantIndex = variant.index;
      item.orderId = buildOrderId(item.hexId, variant.index);
      renderCatalog();
    });

    container.appendChild(button);
  });

  return container;
};

const renderCatalog = () => {
  catalogList.innerHTML = "";
  const usePreviews = filteredItems.length > 0 && filteredItems.length <= MAX_PREVIEW_RESULTS;
  catalogList.classList.toggle("condensed", filteredItems.length > MAX_PREVIEW_RESULTS);

  if (filteredItems.length === 0) {
    catalogList.innerHTML = isSearchEmpty
      ? "<p>Enter a search term to see items.</p>"
      : "<p>No items match your search.</p>";
    return;
  }

  filteredItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "catalog-card";
    if (!usePreviews) {
      card.classList.add("condensed-card");
    }

    const spriteFrame = buildSpriteFrame(item, usePreviews);

    let title;
    let meta;
    if (usePreviews) {
      title = document.createElement("h3");
      title.textContent = item.name;

      meta = document.createElement("div");
      meta.className = "catalog-meta";
      meta.textContent = `${item.superCategory} · ${item.kindLabel} · ${getVariantMetaLabel(item)}`;
    } else {
      title = document.createElement("div");
      title.className = "catalog-name-box";
      title.textContent = item.name;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add to order";
    button.disabled = orderItems.length >= MAX_SLOTS;
    button.addEventListener("click", () => addToOrder(item));

    const variantPicker = usePreviews ? buildVariantPicker(item) : null;

    if (variantPicker) {
      card.append(spriteFrame, title, meta, variantPicker, button);
    } else {
      if (meta) {
        card.append(spriteFrame, title, meta, button);
      } else {
        card.append(spriteFrame, title, button);
      }
    }
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

    const spriteFrame = buildSpriteFrame(item);

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${item.name}`;

    const meta = document.createElement("div");
    meta.className = "catalog-meta";
    meta.textContent = `${item.superCategory} · ${item.kindLabel} · ${getVariantMetaLabel(item)}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Remove";
    button.addEventListener("click", () => removeFromOrder(index));

    card.append(spriteFrame, title, meta, button);
    orderSlots.appendChild(card);
  });

  updateOrderCommand();
};

const updateOrderCommand = () => {
  if (orderItems.length === 0) {
    orderCommand.textContent = "$ordercat";
    copyOrderButton.disabled = true;
    copyCommandButton.disabled = true;
    return;
  }

  const orderIds = orderItems.map((item) => item.orderId);
  orderCommand.textContent = `$ordercat ${orderIds.join(" ")}`;
  copyOrderButton.disabled = false;
  copyCommandButton.disabled = false;
};

const addToOrder = (item) => {
  if (orderItems.length >= MAX_SLOTS) {
    return;
  }
  const variantIndex = getSelectedVariantIndex(item);
  orderItems.push({
    ...item,
    selectedVariantIndex: variantIndex,
    orderId: buildOrderId(item.hexId, variantIndex),
  });
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
  isSearchEmpty = query.length === 0;
  if (isSearchEmpty) {
    filteredItems = [];
    renderCatalog();
    return;
  }

  filteredItems = catalogItems.filter((item) => {
    const matchesCategory = activeCategories.size === 0 || activeCategories.has(item.superCategory);
    const searchable =
      `${item.name} ${item.superCategory} ${item.kindLabel} ${getVariantMetaLabel(item)}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesCategory && matchesQuery;
  });

  renderCatalog();
};

const resetCategoryFilters = () => {
  activeCategories.clear();
  activeCategories.add(DEFAULT_SUPER_CATEGORY);
  updateCategoryToggleState();
};

const updateCategoryToggleState = () => {
  if (!categoryToggles) {
    return;
  }
  categoryToggles.querySelectorAll("button[data-category]").forEach((button) => {
    const category = button.dataset.category;
    const isActive = activeCategories.has(category);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive.toString());
  });
};

const populateCategoryToggles = () => {
  const categories = Array.from(new Set(catalogItems.map((item) => item.superCategory))).sort();
  categoryToggles.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-toggle";
    button.dataset.category = category;
    button.textContent = category;
    button.addEventListener("click", () => {
      if (activeCategories.has(category)) {
        activeCategories.delete(category);
      } else {
        activeCategories.add(category);
      }
      updateCategoryToggleState();
      filterCatalog();
    });
    categoryToggles.appendChild(button);
  });
  updateCategoryToggleState();
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    window.alert("Unable to copy. Please copy manually.");
  }
};

const loadSpriteVariants = async () => {
  try {
    const response = await fetch(DATA_PATHS.spriteMap);
    const entries = await response.json();
    entries.forEach((entry) => {
      if (!entry || !entry.filename) {
        return;
      }
      const match = entry.filename.match(/^([0-9A-F]+)_(\d+)\.png$/i);
      if (!match) {
        return;
      }
      const hexId = match[1].toUpperCase();
      const variantIndex = Number.parseInt(match[2], 10);
      if (Number.isNaN(variantIndex)) {
        return;
      }
      if (!spriteVariantMap.has(hexId)) {
        spriteVariantMap.set(hexId, new Set());
      }
      spriteVariantMap.get(hexId).add(variantIndex);
    });
  } catch (error) {
    console.warn("Unable to load sprite variants.", error);
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
    const rawKindName =
      kindIndex !== undefined && ITEM_KIND_NAMES[kindIndex] ? ITEM_KIND_NAMES[kindIndex] : "Unknown";
    const kindName = formatKindName(rawKindName);
    const superCategory = getSuperCategory(rawKindName);
    const hexId = formatItemHexId(index);
    const variantSet = spriteVariantMap.get(hexId);
    const variants = variantSet
      ? Array.from(variantSet)
          .sort((a, b) => a - b)
          .map((variantIndex) => ({
            index: variantIndex,
            orderId: buildOrderId(hexId, variantIndex),
          }))
      : [];
    const selectedVariantIndex = variants.length > 0 ? variants[0].index : null;
    return {
      id: index,
      hexId,
      orderId: buildOrderId(hexId, selectedVariantIndex),
      kindIndex,
      name,
      kindLabel: kindName,
      superCategory,
      variants,
      selectedVariantIndex,
    };
  });
};

const init = async () => {
  await loadUnitIconAssets();
  await loadSpriteVariants();
  catalogItems = await loadCatalogItems();
  filteredItems = [];
  populateCategoryToggles();
  renderCatalog();
  renderOrder();
};

searchInput.addEventListener("input", filterCatalog);
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  resetCategoryFilters();
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
