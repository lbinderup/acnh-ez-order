const catalogList = document.getElementById("catalog-list");
const orderSlots = document.getElementById("order-slots");
const searchInput = document.getElementById("search-input");
const categoryToggles = document.getElementById("category-toggles");
const clearSearchButton = document.getElementById("clear-search");
const clearOrderButton = document.getElementById("clear-order");
const saveOrderButton = document.getElementById("save-order");
const copyOrderButton = document.getElementById("copy-order");
const pasteOrderButton = document.getElementById("paste-order");
const slotCount = document.getElementById("slot-count");
const orderDrawer = document.getElementById("order-drawer");
const drawerSlotCount = document.getElementById("drawer-slot-count");
const orderDrawerList = document.getElementById("order-drawer-list");
const drawerClearButton = document.getElementById("drawer-clear");
const drawerSaveButton = document.getElementById("drawer-save");
const drawerCopyButton = document.getElementById("drawer-copy");
const orderDrawerToggle = document.getElementById("order-drawer-toggle");
const unsafeToggle = document.getElementById("unsafe-toggle");
const sortSelect = document.getElementById("sort-select");
const addAllButton = document.getElementById("add-all");
const savedOrdersList = document.getElementById("saved-orders-list");
const savedOrdersEmpty = document.getElementById("saved-orders-empty");
let categoryDropdownListenerBound = false;
let isDrawerCollapsed = false;

const MAX_SLOTS = 40;
const MAX_PREVIEW_RESULTS = 80;
const PREVIEW_LOAD_DELAY_MS = 50;
const DEFAULT_SUPER_CATEGORY = "Furniture";
const GROUPED_CATEGORIES = new Set(["Clothing", "Furniture", "Materials", "Nature", "Tools", "Misc"]);
const SUBCATEGORY_PRIORITY = {
  Clothing: [
    "Tops",
    "Bottoms",
    "Dresses",
    "Shoes",
    "Socks",
    "Hats",
    "Helmets",
    "Accessories",
    "Bags",
    "Outfits",
    "Other",
  ],
  Furniture: [
    "Furniture",
    "Walls",
    "Floors",
    "Rugs",
    "Structures",
    "Art",
    "Decor",
    "Infrastructure",
    "Rooms",
    "Custom",
    "Other",
  ],
  Materials: [
    "Crafting",
    "Customization",
    "Cooking",
    "Minerals",
    "Wood",
    "Shells",
    "Seasonal",
    "Sweets",
    "Other",
  ],
  Nature: ["Fish", "Insects", "Fossils", "Gyroids", "Flowers", "Fruit", "Mushrooms", "Shrubs", "Other"],
  Tools: ["Core Tools", "Utility", "Instruments", "Party", "Apps", "Other"],
  Misc: ["Consumables", "Tickets", "Recipes", "Music", "Events", "Quests", "Currency", "Other"],
};
let catalogItems = [];
let filteredItems = [];
const orderItems = [];
const spriteCache = new Map();
const spriteLoadPromises = new Map();
const unitIconCache = new Map();
const unitIconLoadPromises = new Map();
const spriteVariantMap = new Map();
const orderIdLookup = new Map();
let savedOrders = [];

const STORAGE_KEYS = {
  currentOrder: "acnh-ez-order:current-order",
  savedOrders: "acnh-ez-order:saved-orders",
};

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
let showUnsafeItems = false;
const activeSuperCategories = new Set();
const activeSubCategoriesBySuper = new Map();
let categoryData = new Map();
let sortMode = "alpha";

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

const getSubCategory = (kindName, superCategory) => {
  if (!kindName || !GROUPED_CATEGORIES.has(superCategory)) {
    return null;
  }
  if (superCategory === "Clothing") {
    if (kindName.startsWith("Top_")) return "Tops";
    if (kindName.startsWith("Bottoms_")) return "Bottoms";
    if (kindName.startsWith("Onepiece_")) return "Dresses";
    if (kindName.startsWith("Shoes_") || kindName.includes("Kind_Shoes")) return "Shoes";
    if (kindName.includes("Kind_Socks")) return "Socks";
    if (kindName.includes("Kind_Cap")) return "Hats";
    if (kindName.includes("Kind_Helmet")) return "Helmets";
    if (kindName.includes("Kind_Accessory")) return "Accessories";
    if (kindName.includes("Kind_Bag") || kindName.includes("Kind_HandBag")) return "Bags";
    if (
      kindName.includes("Kind_ShopTorso") ||
      kindName.includes("Kind_PlayerDemoOutfit") ||
      kindName.includes("Kind_NpcOutfit")
    ) {
      return "Outfits";
    }
    return "Other";
  }
  if (superCategory === "Furniture") {
    if (kindName.includes("Kind_Wall") || kindName.includes("Kind_RoomWall")) return "Walls";
    if (kindName.includes("Kind_Floor") || kindName.includes("Kind_RoomFloor")) return "Floors";
    if (kindName.includes("Kind_Rug") || kindName.includes("Kind_CommonFabricRug")) return "Rugs";
    if (kindName.includes("Kind_Pillar") || kindName.includes("Kind_Counter")) return "Structures";
    if (
      kindName.includes("Kind_Picture") ||
      kindName.includes("Kind_Poster") ||
      kindName.includes("Kind_Sculpture")
    ) {
      return "Art";
    }
    if (kindName.includes("Kind_DoorDeco")) return "Decor";
    if (
      kindName.includes("Kind_BridgeItem") ||
      kindName.includes("Kind_SlopeItem") ||
      kindName.includes("Kind_HousePost") ||
      kindName.includes("Kind_HousingKit")
    ) {
      return "Infrastructure";
    }
    if (kindName.includes("Kind_GardenEditList") || kindName.includes("Kind_OneRoomBox")) {
      return "Rooms";
    }
    if (kindName.includes("Kind_MyDesign") || kindName.includes("Kind_CommonFabric")) {
      return "Custom";
    }
    if (kindName.startsWith("Ftr_") || kindName.includes("Kind_Ftr")) return "Furniture";
    return "Other";
  }
  if (superCategory === "Materials") {
    if (kindName.includes("Kind_CraftMaterial")) return "Crafting";
    if (kindName.includes("Kind_CraftRemake")) return "Customization";
    if (kindName.includes("Kind_CookingMaterial")) return "Cooking";
    if (kindName.includes("Kind_Ore") || kindName.includes("Kind_Stone") || kindName.includes("Kind_Clay")) {
      return "Minerals";
    }
    if (kindName.includes("Kind_Wood")) return "Wood";
    if (kindName.includes("Kind_Shell")) return "Shells";
    if (kindName.includes("Kind_StarPiece") || kindName.includes("Kind_SnowCrystal") || kindName.includes("Kind_Feather")) {
      return "Seasonal";
    }
    if (kindName.includes("Kind_Candy") || kindName.includes("Kind_Candyfloss") || kindName.includes("Kind_Honeycomb")) {
      return "Sweets";
    }
    return "Other";
  }
  if (superCategory === "Nature") {
    if (kindName.includes("Kind_Fish") || kindName.includes("Kind_DiveFish")) return "Fish";
    if (kindName.includes("Kind_Insect")) return "Insects";
    if (kindName.includes("Kind_Fossil")) return "Fossils";
    if (kindName.includes("Kind_Gyroid")) return "Gyroids";
    if (kindName.includes("Kind_Flower")) return "Flowers";
    if (kindName.includes("Kind_Fruit")) return "Fruit";
    if (kindName.includes("Kind_Mushroom")) return "Mushrooms";
    if (kindName.includes("Kind_Bush")) return "Shrubs";
    return "Other";
  }
  if (superCategory === "Tools") {
    if (
      matchesAny(kindName, [
        "Kind_Axe",
        "Kind_Net",
        "Kind_Shovel",
        "Kind_Ladder",
        "Kind_FishingRod",
        "Kind_Slingshot",
        "Kind_Watering",
      ])
    ) {
      return "Core Tools";
    }
    if (kindName.includes("Kind_Megaphone")) return "Utility";
    if (matchesAny(kindName, ["Kind_Ocarina", "Kind_Panflute", "Kind_Maracas", "Kind_Tambourine"])) {
      return "Instruments";
    }
    if (matchesAny(kindName, ["Kind_Partyhorn", "Kind_PartyPopper", "Kind_BlowBubble"])) {
      return "Party";
    }
    if (kindName.includes("Kind_SmartPhone")) return "Apps";
    if (kindName.includes("Kind_SubTool")) return "Other";
    return "Other";
  }
  if (superCategory === "Misc") {
    if (matchesAny(kindName, ["Kind_Medicine", "Kind_Drink", "Kind_Juice", "Kind_Icecandy", "Kind_Tapioca"])) {
      return "Consumables";
    }
    if (kindName.includes("Ticket")) return "Tickets";
    if (kindName.includes("Recipe") || kindName.includes("DIYRecipe")) return "Recipes";
    if (kindName.includes("Kind_Music")) return "Music";
    if (matchesAny(kindName, ["Kind_Firework", "Kind_FierworkHand", "Kind_LoveCrystal", "Kind_RainbowFeather"])) {
      return "Events";
    }
    if (matchesAny(kindName, ["Kind_LostQuest", "Kind_Quest", "Kind_MessageBottle"])) {
      return "Quests";
    }
    if (matchesAny(kindName, ["Kind_Money", "Kind_Turnip"])) {
      return "Currency";
    }
    return "Other";
  }
  return null;
};

const getCategoryLabel = (item) =>
  item.subCategory ? `${item.superCategory} · ${item.subCategory}` : item.superCategory;

const toTitleCase = (value) => value.replace(/\b\w/g, (char) => char.toUpperCase());

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
    const titleCased = toTitleCase(cleaned);
    if (seen.has(titleCased)) {
      return `${titleCased} (#${String(index).padStart(3, "0")})`;
    }
    seen.add(titleCased);
    return titleCased;
  });
};

const normalizePreviewKey = (value) =>
  value
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const applyPreviewIconOverrides = (items) => {
  const flowerStemMap = new Map();
  const shrubYoungMap = new Map();

  items.forEach((item) => {
    if (item.subCategory === "Flowers") {
      const stemMatch = item.name.match(/^(.*)\s+Stems$/i);
      if (stemMatch) {
        flowerStemMap.set(normalizePreviewKey(stemMatch[1]), item.hexId);
      }
    }
    if (item.subCategory === "Shrubs") {
      const youngMatch = item.name.match(/^Young\s+(.*)$/i);
      if (youngMatch) {
        shrubYoungMap.set(normalizePreviewKey(youngMatch[1]), item.hexId);
      }
    }
  });

  items.forEach((item) => {
    if (item.subCategory === "Flowers") {
      const stageMatch = item.name.match(/^(.*)\s+(Buds|Sprouts|Plant)$/i);
      if (stageMatch) {
        const stemHexId = flowerStemMap.get(normalizePreviewKey(stageMatch[1]));
        if (stemHexId) {
          item.previewHexId = stemHexId;
        }
      }
      return;
    }
    if (item.subCategory === "Shrubs") {
      const shrubStageMatch = item.name.match(/^(.*)\s+(Bush|Nursery)$/i);
      if (shrubStageMatch) {
        const youngHexId = shrubYoungMap.get(normalizePreviewKey(shrubStageMatch[1]));
        if (youngHexId) {
          item.previewHexId = youngHexId;
        }
      }
    }
  });
};

const UNSAFE_KIND_TOKENS = ["Dummy", "CliffMaker", "PlayerDemoOutfit", "NpcOutfit", "NnpcRoomMarker", "SequenceOnly", "SmartPhone","MyDesignObject","MyDesignTexture","CommonFabricObject"];
const UNSAFE_NAME_PATTERNS = [/\(internal\)/i, /^dummy\b/i];
const CLOTHING_EMPTY_NAME_PATTERN = /^\(Item #\d+\)$/;

const isUnsafeItem = (name, rawKindName, superCategory) => {
  if (name && UNSAFE_NAME_PATTERNS.some((pattern) => pattern.test(name))) {
    return true;
  }
  if (!rawKindName) {
    return false;
  }
  if (rawKindName.includes("HousingKit")) {
    return true;
  }
  if (superCategory === "Clothing" && name && CLOTHING_EMPTY_NAME_PATTERN.test(name)) {
    return true;
  }
  if (getSubCategory(rawKindName, superCategory) === "Infrastructure")
  {
	  return true;
  }
  return UNSAFE_KIND_TOKENS.some((token) => rawKindName.includes(token));
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

const getUnitIconUrl = async (itemId) => {
  if (!unitIconDumpBytes || !unitIconHeaderMap || !unitIconPointerMap) {
    return null;
  }
  const itemHex = itemId.toString(16).toUpperCase();
  const spriteKey = unitIconPointerMap.get(itemHex);
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

const buildSpriteCandidates = (hexId, variantIndex, subVariantIndex) => {
  const candidates = [];
  if (variantIndex !== null && variantIndex !== undefined) {
    if (subVariantIndex !== null && subVariantIndex !== undefined) {
      candidates.push(`${SPRITE_BASE_PATH}/${hexId}_${variantIndex}_${subVariantIndex}.png`);
    }
    candidates.push(`${SPRITE_BASE_PATH}/${hexId}_${variantIndex}.png`);
  }
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}.png`);
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}_0.png`);
  candidates.push(`${SPRITE_BASE_PATH}/${hexId}_0_0.png`);
  return candidates;
};

const resolveSpriteUrl = (hexId, variantIndex, subVariantIndex) =>
  new Promise((resolve) => {
    const candidates = buildSpriteCandidates(hexId, variantIndex, subVariantIndex);
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

const buildSpriteCacheKey = (hexId, variantIndex, subVariantIndex) => {
  if (variantIndex === null || variantIndex === undefined) {
    return hexId;
  }
  if (subVariantIndex === null || subVariantIndex === undefined) {
    return `${hexId}_${variantIndex}`;
  }
  return `${hexId}_${variantIndex}_${subVariantIndex}`;
};

const assignSprite = (image, hexId, variantIndex, subVariantIndex) => {
  const cacheKey = buildSpriteCacheKey(hexId, variantIndex, subVariantIndex);
  if (spriteCache.has(cacheKey)) {
    const cached = spriteCache.get(cacheKey);
    image.src = cached || DEFAULT_SPRITE;
    return;
  }

  image.src = DEFAULT_SPRITE;
  if (!spriteLoadPromises.has(cacheKey)) {
    const promise = resolveSpriteUrl(hexId, variantIndex, subVariantIndex)
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

const assignUnitIcon = (image, itemId) => {
  if (itemId === undefined || itemId === null) {
    image.hidden = true;
    return;
  }
  if (unitIconCache.has(itemId)) {
    const cached = unitIconCache.get(itemId);
    if (cached) {
      image.src = cached;
      image.hidden = false;
    } else {
      image.hidden = true;
    }
    return;
  }

  image.hidden = true;
  if (!unitIconLoadPromises.has(itemId)) {
    const promise = getUnitIconUrl(itemId)
      .then((url) => {
        unitIconCache.set(itemId, url);
        unitIconLoadPromises.delete(itemId);
        return url;
      })
      .catch(() => {
        unitIconCache.set(itemId, null);
        unitIconLoadPromises.delete(itemId);
        return null;
      });
    unitIconLoadPromises.set(itemId, promise);
  }

  unitIconLoadPromises.get(itemId).then((url) => {
    if (url) {
      image.src = url;
      image.hidden = false;
    }
  });
};

const assignSpriteWithDelay = (image, hexId, variantIndex, subVariantIndex, delayMs) => {
  if (!delayMs || delayMs <= 0) {
    assignSprite(image, hexId, variantIndex, subVariantIndex);
    return;
  }
  image.src = DEFAULT_SPRITE;
  window.setTimeout(() => {
    assignSprite(image, hexId, variantIndex, subVariantIndex);
  }, delayMs);
};

const buildSpriteFrame = (item, usePreview = true, delayMs = 0) => {
  const frame = document.createElement("div");
  frame.className = "sprite-frame";

  const image = document.createElement("img");
  image.className = "item-sprite";
  image.alt = item.name;
  if (usePreview) {
    assignSpriteWithDelay(
      image,
      getPreviewHexId(item),
      getSelectedVariantIndex(item),
      getSelectedSubVariantIndex(item),
      delayMs
    );
  } else {
    image.hidden = true;
  }

  const typeIcon = document.createElement("img");
  typeIcon.className = "type-icon";
  typeIcon.alt = "";
  typeIcon.setAttribute("aria-hidden", "true");
  assignUnitIcon(typeIcon, item.id);

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

const getSelectedSubVariantIndex = (item) => {
  if (!item.subVariantsByVariant || item.subVariantsByVariant.size === 0) {
    return null;
  }
  const variantIndex = getSelectedVariantIndex(item);
  if (variantIndex === null || variantIndex === undefined) {
    return null;
  }
  const subVariants = item.subVariantsByVariant.get(variantIndex) || [];
  if (subVariants.length === 0) {
    return null;
  }
  if (item.selectedSubVariantIndex === null || item.selectedSubVariantIndex === undefined) {
    return subVariants[0];
  }
  if (!subVariants.includes(item.selectedSubVariantIndex)) {
    return subVariants[0];
  }
  return item.selectedSubVariantIndex;
};

const getPreviewHexId = (item) => item.previewHexId || item.hexId;

const getVariantMetaLabel = (item) => {
  const variantIndex = getSelectedVariantIndex(item);
  if (variantIndex === null || variantIndex === undefined) {
    return null;
  }
  const subVariantIndex = getSelectedSubVariantIndex(item);
  if (subVariantIndex === null || subVariantIndex === undefined) {
    return `Variant ${variantIndex}`;
  }
  return `Variant ${variantIndex} · Subvariant ${subVariantIndex}`;
};

const buildVariantRow = ({ item, variants, selectedIndex, label, onSelect }) => {
  const row = document.createElement("div");
  row.className = "variant-picker-row";

  variants.forEach((variant) => {
    const variantIndex = typeof variant === "number" ? variant : variant.index;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "variant-option";
    if (variantIndex === selectedIndex) {
      button.classList.add("is-selected");
    }

    const image = document.createElement("img");
    image.className = "variant-sprite";
    image.alt = `${item.name} ${label} ${variantIndex}`;
    if (label === "subvariant") {
      assignSprite(image, item.hexId, getSelectedVariantIndex(item), variantIndex);
    } else {
      const previewSubVariant = item.subVariantsByVariant
        ? (item.subVariantsByVariant.get(variantIndex) || [])[0] ?? null
        : null;
      assignSprite(image, item.hexId, variantIndex, previewSubVariant);
    }

    button.appendChild(image);
    button.addEventListener("click", () => onSelect(variantIndex));

    row.appendChild(button);
  });

  return row;
};

const buildVariantPicker = (item) => {
  const primaryVariants = item.variants || [];
  const selectedVariantIndex = getSelectedVariantIndex(item);
  const subVariants =
    item.subVariantsByVariant && selectedVariantIndex !== null && selectedVariantIndex !== undefined
      ? item.subVariantsByVariant.get(selectedVariantIndex) || []
      : [];
  const hasPrimaryPicker = primaryVariants.length > 1;
  const hasSubPicker = subVariants.length > 1;
  if (!hasPrimaryPicker && !hasSubPicker) {
    return null;
  }
  const container = document.createElement("div");
  container.className = "variant-picker";

  if (hasPrimaryPicker) {
    const primaryRow = buildVariantRow({
      item,
      variants: primaryVariants,
      selectedIndex: selectedVariantIndex,
      label: "variant",
      onSelect: (variantIndex) => {
        item.selectedVariantIndex = variantIndex;
        const nextSubVariants = item.subVariantsByVariant
          ? item.subVariantsByVariant.get(variantIndex) || []
          : [];
        if (!nextSubVariants.includes(item.selectedSubVariantIndex)) {
          item.selectedSubVariantIndex = null;
        }
        item.orderId = buildOrderId(item.hexId, variantIndex);
        updateCatalogCard(item);
      },
    });

    const addAllVariantsButton = document.createElement("button");
    addAllVariantsButton.type = "button";
    addAllVariantsButton.className = "variant-option variant-add-all";
    addAllVariantsButton.textContent = "+";
    addAllVariantsButton.setAttribute("aria-label", "Add all main variants to order");
    addAllVariantsButton.disabled = false;
    addAllVariantsButton.addEventListener("click", () => addAllVariantsToOrder(item));
    primaryRow.appendChild(addAllVariantsButton);

    container.appendChild(primaryRow);
  }

  if (hasSubPicker) {
    const selectedSubVariantIndex = getSelectedSubVariantIndex(item);
    container.appendChild(
      buildVariantRow({
        item,
        variants: subVariants,
        selectedIndex: selectedSubVariantIndex,
        label: "subvariant",
        onSelect: (subVariantIndex) => {
          const currentVariantIndex = getSelectedVariantIndex(item);
          item.selectedVariantIndex = currentVariantIndex;
          item.selectedSubVariantIndex = subVariantIndex;
          item.orderId = buildOrderId(item.hexId, currentVariantIndex);
          updateCatalogCard(item);
        },
      })
    );
  }

  return container;
};

const sortSubcategories = (superCategory, subcategories) => {
  const priorities = SUBCATEGORY_PRIORITY[superCategory] || [];
  return [...subcategories].sort((a, b) => {
    const aIndex = priorities.indexOf(a);
    const bIndex = priorities.indexOf(b);
    const aOrder = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bOrder = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.localeCompare(b);
  });
};

const buildCategoryData = (items) => {
  const data = new Map();
  items.forEach((item) => {
    if (!data.has(item.superCategory)) {
      data.set(item.superCategory, new Set());
    }
    if (GROUPED_CATEGORIES.has(item.superCategory)) {
      data.get(item.superCategory).add(item.subCategory || "Other");
    }
  });
  return data;
};

const setDefaultCategoryFilters = () => {
  activeSuperCategories.clear();
  activeSubCategoriesBySuper.clear();
  if (!categoryData.has(DEFAULT_SUPER_CATEGORY)) {
    return;
  }
  if (GROUPED_CATEGORIES.has(DEFAULT_SUPER_CATEGORY)) {
    const defaultSubcategories = categoryData.get(DEFAULT_SUPER_CATEGORY);
    if (defaultSubcategories && defaultSubcategories.size > 0) {
      activeSubCategoriesBySuper.set(
        DEFAULT_SUPER_CATEGORY,
        new Set(defaultSubcategories)
      );
    }
  } else {
    activeSuperCategories.add(DEFAULT_SUPER_CATEGORY);
  }
};

const hasActiveCategoryFilters = () => {
  if (activeSuperCategories.size > 0) {
    return true;
  }
  return Array.from(activeSubCategoriesBySuper.values()).some((set) => set.size > 0);
};

const matchesCategoryFilter = (item) => {
  if (!hasActiveCategoryFilters()) {
    return true;
  }
  if (GROUPED_CATEGORIES.has(item.superCategory)) {
    const activeSubcategories = activeSubCategoriesBySuper.get(item.superCategory);
    if (!activeSubcategories || activeSubcategories.size === 0) {
      return false;
    }
    return activeSubcategories.has(item.subCategory || "Other");
  }
  return activeSuperCategories.has(item.superCategory);
};

const applySort = (items) => {
  const sorted = [...items];
  if (sortMode === "category") {
    sorted.sort((a, b) => {
      const superCompare = a.superCategory.localeCompare(b.superCategory);
      if (superCompare !== 0) {
        return superCompare;
      }
      const subCompare = (a.subCategory || "").localeCompare(b.subCategory || "");
      if (subCompare !== 0) {
        return subCompare;
      }
      const kindCompare = (a.kindLabel || "").localeCompare(b.kindLabel || "");
      if (kindCompare !== 0) {
        return kindCompare;
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }
  sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
};

const getOrderItemCount = (item) => {
  const variantIndex = getSelectedVariantIndex(item);
  const orderId = buildOrderId(item.hexId, variantIndex);
  return orderItems.filter((orderItem) => orderItem.orderId === orderId).length;
};

const updateAddAllButton = () => {
  if (!addAllButton) {
    return;
  }
  if (filteredItems.length === 0) {
    addAllButton.hidden = true;
    return;
  }
  addAllButton.hidden = false;
  addAllButton.disabled = false;
  addAllButton.textContent = `Add results (${filteredItems.length})`;
  addAllButton.setAttribute("aria-label", `Add ${filteredItems.length} results to order`);
};

const updateCatalogActionButtons = () => {
  catalogList.querySelectorAll(".add-to-order").forEach((button) => {
    button.disabled = false;
  });
  catalogList.querySelectorAll(".variant-add-all").forEach((button) => {
    button.disabled = false;
  });
};

const renderCatalog = () => {
  catalogList.innerHTML = "";
  const usePreviews = filteredItems.length > 0 && filteredItems.length <= MAX_PREVIEW_RESULTS;
  catalogList.classList.toggle("condensed", filteredItems.length > MAX_PREVIEW_RESULTS);

  if (filteredItems.length === 0) {
    catalogList.innerHTML = isSearchEmpty
      ? "<p>Enter a search term to see items.</p>"
      : "<p>No items match your search.</p>";
    updateAddAllButton();
    return;
  }

  filteredItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "catalog-card";
    card.dataset.hexId = item.hexId;
    if (!usePreviews) {
      card.classList.add("condensed-card");
    }

    const spriteFrame = buildSpriteFrame(
      item,
      usePreviews,
      usePreviews ? index * PREVIEW_LOAD_DELAY_MS : 0
    );

    let title;
    let meta;
    if (usePreviews) {
      title = document.createElement("h3");
      title.textContent = item.name;

      meta = document.createElement("div");
      meta.className = "catalog-meta";
	  var variantLabel = getVariantMetaLabel(item);
	  
	  if (variantLabel === null) {
      meta.textContent = `${getCategoryLabel(item)} · ${item.kindLabel}`;
	  }
	  else {
      meta.textContent = `${getCategoryLabel(item)} · ${item.kindLabel} · ${getVariantMetaLabel(item)}`;
	  }
    } else {
      title = document.createElement("div");
      title.className = "catalog-name-box";
      title.textContent = item.name;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-to-order";
    button.textContent = "+";
    button.setAttribute("aria-label", "Add one to order");
    button.disabled = false;
    button.addEventListener("click", () => addToOrder(item));

    const variantCount = item.variants ? item.variants.length : 0;
    card.dataset.variantCount = variantCount.toString();

    const orderCount = getOrderItemCount(item);
    const countBadge = document.createElement("span");
    countBadge.className = "order-count";
    countBadge.textContent = `x${orderCount}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-from-order";
    removeButton.textContent = "−";
    removeButton.setAttribute("aria-label", "Remove one from order");
    removeButton.hidden = orderCount === 0;
    removeButton.addEventListener("click", () => removeOneFromOrder(item));

    const actionRow = document.createElement("div");
    actionRow.className = "catalog-card-actions";
    if (orderCount > 0) {
      actionRow.append(button, countBadge, removeButton);
    } else {
      actionRow.append(button, removeButton);
    }

    const variantPicker = usePreviews ? buildVariantPicker(item) : null;

    if (variantPicker) {
      card.append(spriteFrame, title, meta, variantPicker, actionRow);
    } else {
      if (meta) {
        card.append(spriteFrame, title, meta, actionRow);
      } else {
        card.append(spriteFrame, title, actionRow);
      }
    }
    catalogList.appendChild(card);
  });

  updateAddAllButton();
};

const updateCatalogCard = (item) => {
  const card = catalogList.querySelector(`[data-hex-id="${item.hexId}"]`);
  if (!card) {
    return;
  }

  const image = card.querySelector(".item-sprite");
  if (image) {
    assignSprite(
      image,
      getPreviewHexId(item),
      getSelectedVariantIndex(item),
      getSelectedSubVariantIndex(item)
    );
  }

  const meta = card.querySelector(".catalog-meta");
  if (meta) {
    const variantLabel = getVariantMetaLabel(item);
    meta.textContent =
      variantLabel === null
        ? `${getCategoryLabel(item)} · ${item.kindLabel}`
        : `${getCategoryLabel(item)} · ${item.kindLabel} · ${variantLabel}`;
  }

  const existingPicker = card.querySelector(".variant-picker");
  const nextPicker = buildVariantPicker(item);
  if (existingPicker && nextPicker) {
    existingPicker.replaceWith(nextPicker);
  } else if (existingPicker && !nextPicker) {
    existingPicker.remove();
  } else if (!existingPicker && nextPicker) {
    const actionRow = card.querySelector(".catalog-card-actions");
    if (actionRow) {
      actionRow.before(nextPicker);
    } else {
      card.appendChild(nextPicker);
    }
  }

  const orderCount = getOrderItemCount(item);
  const actionRow = card.querySelector(".catalog-card-actions");
  const existingBadge = card.querySelector(".order-count");
  if (orderCount > 0) {
    if (existingBadge) {
      existingBadge.textContent = `x${orderCount}`;
      existingBadge.hidden = false;
    } else {
      const badge = document.createElement("span");
      badge.className = "order-count";
      badge.textContent = `x${orderCount}`;
      badge.hidden = false;
      if (actionRow) {
        const removeButton = actionRow.querySelector(".remove-from-order");
        if (removeButton) {
          actionRow.insertBefore(badge, removeButton);
        } else {
          actionRow.append(badge);
        }
      } else {
        card.append(badge);
      }
    }
  } else if (existingBadge) {
    existingBadge.remove();
  }

  const addButton = card.querySelector(".add-to-order");
  if (addButton) {
    addButton.disabled = false;
  }

  const removeButton = card.querySelector(".remove-from-order");
  if (removeButton) {
    removeButton.hidden = orderCount === 0;
  }

  const addVariantsButton = card.querySelector(".variant-add-all");
  if (addVariantsButton) {
    addVariantsButton.disabled = false;
  }
};

const safeParseJSON = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const serializeOrderItem = (item) => ({
  hexId: item.hexId,
  name: item.name,
  orderId: item.orderId,
  selectedVariantIndex: item.selectedVariantIndex ?? null,
  selectedSubVariantIndex: item.selectedSubVariantIndex ?? null,
});

const hydrateOrderItem = (storedItem) => {
  const catalogItem = catalogItems.find((item) => item.hexId === storedItem.hexId);
  if (!catalogItem) {
    return null;
  }
  return {
    ...catalogItem,
    selectedVariantIndex: storedItem.selectedVariantIndex ?? getSelectedVariantIndex(catalogItem),
    selectedSubVariantIndex: storedItem.selectedSubVariantIndex ?? getSelectedSubVariantIndex(catalogItem),
    orderId: storedItem.orderId ?? buildOrderId(catalogItem.hexId, storedItem.selectedVariantIndex ?? null),
  };
};

const persistCurrentOrder = () => {
  if (!("localStorage" in window)) {
    return;
  }
  const payload = orderItems.map((item) => serializeOrderItem(item));
  localStorage.setItem(STORAGE_KEYS.currentOrder, JSON.stringify(payload));
};

const persistSavedOrders = () => {
  if (!("localStorage" in window)) {
    return;
  }
  localStorage.setItem(STORAGE_KEYS.savedOrders, JSON.stringify(savedOrders));
};

const loadSavedOrders = () => {
  if (!("localStorage" in window)) {
    savedOrders = [];
    return;
  }
  const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.savedOrders), []);
  savedOrders = Array.isArray(stored) ? stored : [];
};

const loadCurrentOrder = () => {
  if (!("localStorage" in window)) {
    return [];
  }
  const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.currentOrder), []);
  return Array.isArray(stored) ? stored : [];
};

const createOrderRecord = (items) => {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    isComplete: false,
    items: items.map((item) => serializeOrderItem(item)),
  };
};

const saveCurrentOrder = ({ render = true } = {}) => {
  if (orderItems.length === 0) {
    return false;
  }
  const record = createOrderRecord(orderItems);
  savedOrders.unshift(record);
  persistSavedOrders();
  orderItems.length = 0;
  if (render) {
    renderSavedOrders();
    renderOrder();
    refreshCatalogOrderState();
  }
  return true;
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
    meta.textContent = `${getCategoryLabel(item)} · ${item.kindLabel} · ${getVariantMetaLabel(item)}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Remove";
    button.addEventListener("click", () => removeFromOrder(index));

    card.append(spriteFrame, title, meta, button);
    orderSlots.appendChild(card);
  });

  renderOrderDrawer();
  updateOrderCommand();
  updateSaveButtons();
  persistCurrentOrder();
};

const renderOrderDrawer = () => {
  if (!orderDrawer) {
    return;
  }

  if (orderItems.length === 0) {
    isDrawerCollapsed = false;
    orderDrawer.classList.add("is-hidden");
    orderDrawer.hidden = true;
    if (orderDrawerList) {
      orderDrawerList.innerHTML = "";
    }
    return;
  }

  orderDrawer.hidden = false;
  orderDrawer.classList.remove("is-hidden");
  orderDrawer.classList.toggle("is-collapsed", isDrawerCollapsed);

  if (drawerSlotCount) {
    drawerSlotCount.textContent = `${orderItems.length}/${MAX_SLOTS} slots`;
  }

  if (orderDrawerToggle) {
    orderDrawerToggle.textContent = isDrawerCollapsed ? "❯" : "❮";
    orderDrawerToggle.setAttribute(
      "aria-label",
      isDrawerCollapsed ? "Expand order drawer" : "Collapse order drawer"
    );
  }

  if (orderDrawerList) {
    orderDrawerList.innerHTML = "";
    orderItems.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "order-drawer-row";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "order-drawer-remove";
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", `Remove ${item.name} from order`);
      removeButton.addEventListener("click", () => removeFromOrder(index));

      const icon = document.createElement("img");
      icon.className = "order-drawer-icon";
      icon.alt = item.name;
      assignSprite(icon, getPreviewHexId(item), getSelectedVariantIndex(item), getSelectedSubVariantIndex(item));

      const name = document.createElement("div");
      name.className = "order-drawer-name";
      name.textContent = item.name;

      row.append(removeButton, icon, name);
      orderDrawerList.appendChild(row);
    });
  }

  if (drawerCopyButton) {
    drawerCopyButton.disabled = orderItems.length === 0;
  }
};

const renderSavedOrders = () => {
  if (!savedOrdersList) {
    return;
  }
  savedOrdersList.innerHTML = "";

  if (!savedOrders || savedOrders.length === 0) {
    if (savedOrdersEmpty) {
      savedOrdersEmpty.hidden = false;
    }
    return;
  }

  if (savedOrdersEmpty) {
    savedOrdersEmpty.hidden = true;
  }

  savedOrders.forEach((order, index) => {
    const card = document.createElement("article");
    card.className = "saved-order-card";
    card.dataset.orderId = order.id;

    const header = document.createElement("div");
    header.className = "saved-order-header";

    const title = document.createElement("div");
    const label = document.createElement("h3");
    label.textContent = `Order ${index + 1}`;
    const meta = document.createElement("div");
    meta.className = "saved-order-meta";
    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unknown date";
    const itemCount = order.items ? order.items.length : 0;
    meta.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"} · Saved ${createdAt}`;
    title.append(label, meta);

    const status = document.createElement("span");
    status.className = `saved-order-status ${order.isComplete ? "" : "is-incomplete"}`.trim();
    status.textContent = order.isComplete ? "Completed" : "In progress";

    header.append(title, status);

    const commandRow = document.createElement("div");
    commandRow.className = "saved-order-command";
    const commandCode = document.createElement("code");
    const orderIds = (order.items || []).map((item) => item.orderId).filter(Boolean);
    commandCode.textContent = orderIds.length > 0 ? `$ordercat ${orderIds.join(" ")}` : "$ordercat";
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "secondary";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => handleCopyAction(copyButton, commandCode.textContent));
    commandRow.append(commandCode, copyButton);

    const actions = document.createElement("div");
    actions.className = "saved-order-actions";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "secondary";
    completeButton.textContent = order.isComplete ? "Completed" : "Mark complete";
    completeButton.disabled = order.isComplete;
    completeButton.addEventListener("click", () => {
      order.isComplete = true;
      persistSavedOrders();
      renderSavedOrders();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      savedOrders = savedOrders.filter((savedOrder) => savedOrder.id !== order.id);
      persistSavedOrders();
      renderSavedOrders();
    });

    actions.append(completeButton, deleteButton);

    const details = document.createElement("details");
    details.className = "saved-order-details";
    const summary = document.createElement("summary");
    summary.textContent = "View items";
    const list = document.createElement("ul");
    list.className = "saved-order-items";
    (order.items || []).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item.name || item.orderId || "Item";
      list.appendChild(listItem);
    });
    details.append(summary, list);

    card.append(header, commandRow, actions, details);
    savedOrdersList.appendChild(card);
  });
};

const updateOrderCommand = () => {
  if (orderItems.length === 0) {
    copyOrderButton.disabled = true;
    return;
  }

  copyOrderButton.disabled = false;
};

const buildCurrentOrderCommand = () => {
  if (orderItems.length === 0) {
    return "$ordercat";
  }
  const orderIds = orderItems.map((item) => item.orderId);
  return `$ordercat ${orderIds.join(" ")}`;
};

const updateSaveButtons = () => {
  if (saveOrderButton) {
    saveOrderButton.disabled = orderItems.length === 0;
  }
  if (drawerSaveButton) {
    drawerSaveButton.disabled = orderItems.length === 0;
  }
};

const updateCopyButtonFeedback = (button) => {
  if (!button) {
    return;
  }
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = "Copied";
  button.classList.add("is-copied");
  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-copied");
  }, 1500);
};

const handleCopyAction = async (button, text) => {
  const didCopy = await copyToClipboard(text);
  if (didCopy) {
    updateCopyButtonFeedback(button);
  }
};

const buildOrderIdLookup = () => {
  orderIdLookup.clear();
  catalogItems.forEach((item) => {
    if (item.variants && item.variants.length > 0) {
      item.variants.forEach((variant) => {
        orderIdLookup.set(variant.orderId, {
          item,
          variantIndex: variant.index,
        });
      });
    } else {
      orderIdLookup.set(item.hexId, {
        item,
        variantIndex: null,
      });
    }
  });
};

const parseOrderCommand = (text) => {
  if (!text) {
    return null;
  }
  const tokens = text.trim().split(/\s+/);
  if (tokens.length === 0) {
    return null;
  }
  if (tokens[0].toLowerCase() !== "$ordercat") {
    return null;
  }
  return tokens.slice(1);
};

const replaceOrderFromCommand = async () => {
  const shouldReplace = window.confirm(
    "Replace the current order with the $ordercat command in your clipboard? This will remove current items."
  );
  if (!shouldReplace) {
    return;
  }
  let clipboardText = "";
  try {
    clipboardText = await navigator.clipboard.readText();
  } catch (error) {
    window.alert("Unable to read from clipboard.");
    return;
  }
  const orderIds = parseOrderCommand(clipboardText);
  if (!orderIds) {
    window.alert("Clipboard does not contain a valid $ordercat command.");
    return;
  }
  const entries = orderIds
    .map((orderId) => {
      const match = orderIdLookup.get(orderId);
      if (!match) {
        return null;
      }
      const subVariants =
        match.item.subVariantsByVariant && match.variantIndex !== null
          ? match.item.subVariantsByVariant.get(match.variantIndex) || []
          : [];
      const subVariantIndex = subVariants.length > 0 ? subVariants[0] : null;
      return createOrderEntry(match.item, match.variantIndex, subVariantIndex);
    })
    .filter(Boolean);

  if (entries.length === 0) {
    window.alert("No items from that $ordercat command were recognized.");
    return;
  }

  orderItems.length = 0;
  addOrderEntries(entries);
};

const createOrderEntry = (item, variantIndex, subVariantIndex) => ({
  ...item,
  selectedVariantIndex: variantIndex,
  selectedSubVariantIndex: subVariantIndex,
  orderId: buildOrderId(item.hexId, variantIndex),
});

const addOrderEntries = (entries) => {
  if (!entries || entries.length === 0) {
    return;
  }
  const queue = [...entries];
  let savedOrdersUpdated = false;

  while (queue.length > 0) {
    const availableSlots = MAX_SLOTS - orderItems.length;
    if (availableSlots === 0) {
      const saved = saveCurrentOrder({ render: false });
      if (!saved) {
        break;
      }
      savedOrdersUpdated = true;
      continue;
    }

    queue.splice(0, availableSlots).forEach((entry) => {
      orderItems.push(entry);
    });
  }

  renderOrder();
  refreshCatalogOrderState();
  if (savedOrdersUpdated) {
    renderSavedOrders();
  }
};

const addToOrder = (item) => {
  const variantIndex = getSelectedVariantIndex(item);
  const subVariantIndex = getSelectedSubVariantIndex(item);
  addOrderEntries([createOrderEntry(item, variantIndex, subVariantIndex)]);
};

const addAllVariantsToOrder = (item) => {
  if (!item.variants || item.variants.length <= 1) {
    return;
  }
  const entries = item.variants.map((variant) => {
    const variantIndex = typeof variant === "number" ? variant : variant.index;
    const subVariants =
      item.subVariantsByVariant && item.subVariantsByVariant.size > 0
        ? item.subVariantsByVariant.get(variantIndex) || []
        : [];
    const subVariantIndex = subVariants.length > 0 ? subVariants[0] : null;
    return createOrderEntry(item, variantIndex, subVariantIndex);
  });
  addOrderEntries(entries);
};

const removeOneFromOrder = (item) => {
  const variantIndex = getSelectedVariantIndex(item);
  const orderId = buildOrderId(item.hexId, variantIndex);
  const index = orderItems.findIndex((orderItem) => orderItem.orderId === orderId);
  if (index === -1) {
    return;
  }
  orderItems.splice(index, 1);
  renderOrder();
  updateCatalogCard(item);
  updateAddAllButton();
  updateCatalogActionButtons();
};

const addItemsToOrder = (items) => {
  if (!items || items.length === 0) {
    return;
  }
  const entries = items.map((item) => {
    const variantIndex = getSelectedVariantIndex(item);
    const subVariantIndex = getSelectedSubVariantIndex(item);
    return createOrderEntry(item, variantIndex, subVariantIndex);
  });
  addOrderEntries(entries);
};

const removeFromOrder = (index) => {
  const [removedItem] = orderItems.splice(index, 1);
  renderOrder();
  if (removedItem) {
    const catalogItem =
      filteredItems.find((item) => item.hexId === removedItem.hexId) ||
      catalogItems.find((item) => item.hexId === removedItem.hexId);
    if (catalogItem) {
      updateCatalogCard(catalogItem);
    }
  }
  updateAddAllButton();
  updateCatalogActionButtons();
};

const refreshCatalogOrderState = () => {
  filteredItems.forEach((item) => updateCatalogCard(item));
  updateAddAllButton();
  updateCatalogActionButtons();
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
    const matchesCategory = matchesCategoryFilter(item);
    const searchable =
      `${item.name} ${item.superCategory} ${item.subCategory || ""} ${item.kindLabel} ${getVariantMetaLabel(item)}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesUnsafe = showUnsafeItems || !item.isUnsafe;
    return matchesCategory && matchesQuery && matchesUnsafe;
  });

  filteredItems = applySort(filteredItems);
  renderCatalog();
};

const resetCategoryFilters = () => {
  setDefaultCategoryFilters();
  updateCategoryToggleState();
};

const updateCategoryToggleState = () => {
  if (!categoryToggles) {
    return;
  }
  categoryToggles.querySelectorAll("button[data-role='group']").forEach((button) => {
    const category = button.dataset.category;
    const available = categoryData.get(category) || new Set();
    const active = activeSubCategoriesBySuper.get(category) || new Set();
    const isActive = active.size > 0;
    const isPartial = isActive && active.size < available.size;
    button.classList.toggle("is-active", isActive && !isPartial);
    button.classList.toggle("is-partial", isPartial);
    button.setAttribute("aria-pressed", isActive.toString());
  });
  categoryToggles.querySelectorAll("button[data-subcategory]").forEach((button) => {
    const category = button.dataset.category;
    const subcategory = button.dataset.subcategory;
    const active = activeSubCategoriesBySuper.get(category);
    const isActive = active ? active.has(subcategory) : false;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive.toString());
  });
  categoryToggles.querySelectorAll("button[data-role='solo']").forEach((button) => {
    const category = button.dataset.category;
    const isActive = activeSuperCategories.has(category);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive.toString());
  });
};

const closeCategoryDropdowns = (exceptGroup = null) => {
  if (!categoryToggles) {
    return;
  }
  categoryToggles.querySelectorAll(".category-dropdown").forEach((dropdown) => {
    if (exceptGroup && exceptGroup.contains(dropdown)) {
      return;
    }
    dropdown.hidden = true;
    const group = dropdown.closest(".category-group");
    const toggle = group ? group.querySelector("button[data-role='dropdown']") : null;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

const populateCategoryToggles = () => {
  const categories = Array.from(categoryData.keys()).sort();
  categoryToggles.innerHTML = "";
  categories.forEach((category) => {
    if (GROUPED_CATEGORIES.has(category)) {
      const group = document.createElement("div");
      group.className = "category-group";

      const header = document.createElement("div");
      header.className = "category-group-header";

      const split = document.createElement("div");
      split.className = "category-split";

      const parentButton = document.createElement("button");
      parentButton.type = "button";
      parentButton.className = "category-toggle";
      parentButton.dataset.category = category;
      parentButton.dataset.role = "group";
      parentButton.textContent = category;
      parentButton.addEventListener("click", () => {
        const available = categoryData.get(category) || new Set();
        const active = activeSubCategoriesBySuper.get(category);
        if (active && active.size === available.size) {
          activeSubCategoriesBySuper.delete(category);
        } else {
          activeSubCategoriesBySuper.set(category, new Set(available));
        }
        updateCategoryToggleState();
        filterCatalog();
      });

      const dropdownButton = document.createElement("button");
      dropdownButton.type = "button";
      dropdownButton.className = "category-toggle category-dropdown-toggle";
      dropdownButton.dataset.category = category;
      dropdownButton.dataset.role = "dropdown";
      dropdownButton.setAttribute("aria-haspopup", "true");
      dropdownButton.setAttribute("aria-expanded", "false");
      dropdownButton.setAttribute("aria-label", `Toggle ${category} subcategories`);
      dropdownButton.textContent = "▾";

      split.append(parentButton, dropdownButton);
      header.appendChild(split);
      group.appendChild(header);

      const subToggleRow = document.createElement("div");
      subToggleRow.className = "category-dropdown";
      subToggleRow.hidden = true;

      const subcategories = sortSubcategories(category, categoryData.get(category) || new Set());
      subcategories.forEach((subcategory) => {
        const subButton = document.createElement("button");
        subButton.type = "button";
        subButton.className = "category-toggle";
        subButton.dataset.category = category;
        subButton.dataset.subcategory = subcategory;
        subButton.textContent = subcategory;
        subButton.addEventListener("click", () => {
          const active = activeSubCategoriesBySuper.get(category) || new Set();
          if (active.has(subcategory)) {
            active.delete(subcategory);
          } else {
            active.add(subcategory);
          }
          if (active.size === 0) {
            activeSubCategoriesBySuper.delete(category);
          } else {
            activeSubCategoriesBySuper.set(category, active);
          }
          updateCategoryToggleState();
          filterCatalog();
        });
        subToggleRow.appendChild(subButton);
      });

      dropdownButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closeCategoryDropdowns(group);
        const nextHidden = !subToggleRow.hidden;
        subToggleRow.hidden = nextHidden;
        dropdownButton.setAttribute("aria-expanded", (!nextHidden).toString());
      });

      group.appendChild(subToggleRow);
      categoryToggles.appendChild(group);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-toggle";
    button.dataset.category = category;
    button.dataset.role = "solo";
    button.textContent = category;
    button.addEventListener("click", () => {
      if (activeSuperCategories.has(category)) {
        activeSuperCategories.delete(category);
      } else {
        activeSuperCategories.add(category);
      }
      updateCategoryToggleState();
      filterCatalog();
    });
    categoryToggles.appendChild(button);
  });
  updateCategoryToggleState();
  if (!categoryDropdownListenerBound) {
    document.addEventListener("click", (event) => {
      const isDropdownClick =
        event.target.closest(".category-dropdown") || event.target.closest(".category-dropdown-toggle");
      if (!isDropdownClick) {
        closeCategoryDropdowns();
      }
    });
    categoryDropdownListenerBound = true;
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    window.alert("Unable to copy. Please copy manually.");
    return false;
  }
};

const ensureSpriteVariantEntry = (hexId) => {
  if (!spriteVariantMap.has(hexId)) {
    spriteVariantMap.set(hexId, {
      variants: new Set(),
      subVariantsByVariant: new Map(),
    });
  }
  return spriteVariantMap.get(hexId);
};

const loadSpriteVariants = async () => {
  try {
    const response = await fetch(DATA_PATHS.spriteMap);
    const entries = await response.json();
    entries.forEach((entry) => {
      if (!entry || !entry.filename) {
        return;
      }
      const subMatch = entry.filename.match(/^([0-9A-F]+)_(\d+)_(\d+)\.png$/i);
      if (subMatch) {
        const hexId = subMatch[1].toUpperCase();
        const variantIndex = Number.parseInt(subMatch[2], 10);
        const subVariantIndex = Number.parseInt(subMatch[3], 10);
        if (Number.isNaN(variantIndex) || Number.isNaN(subVariantIndex)) {
          return;
        }
        const entryData = ensureSpriteVariantEntry(hexId);
        entryData.variants.add(variantIndex);
        if (!entryData.subVariantsByVariant.has(variantIndex)) {
          entryData.subVariantsByVariant.set(variantIndex, new Set());
        }
        entryData.subVariantsByVariant.get(variantIndex).add(subVariantIndex);
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
      const entryData = ensureSpriteVariantEntry(hexId);
      entryData.variants.add(variantIndex);
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
    const subCategory = getSubCategory(rawKindName, superCategory);
    const hexId = formatItemHexId(index);
    const isUnsafe = isUnsafeItem(name, rawKindName, superCategory);
    const variantData = spriteVariantMap.get(hexId);
    const variants = variantData
      ? Array.from(variantData.variants)
          .sort((a, b) => a - b)
          .map((variantIndex) => ({
            index: variantIndex,
            orderId: buildOrderId(hexId, variantIndex),
          }))
      : [];
    const subVariantsByVariant = new Map();
    if (variantData && variantData.subVariantsByVariant.size > 0) {
      variantData.subVariantsByVariant.forEach((subVariantSet, variantIndex) => {
        subVariantsByVariant.set(
          variantIndex,
          Array.from(subVariantSet).sort((a, b) => a - b)
        );
      });
    }
    const selectedVariantIndex = variants.length > 0 ? variants[0].index : null;
    const selectedSubVariantIndex =
      selectedVariantIndex !== null && subVariantsByVariant.size > 0
        ? (subVariantsByVariant.get(selectedVariantIndex) || [])[0] ?? null
        : null;
    return {
      id: index,
      hexId,
      orderId: buildOrderId(hexId, selectedVariantIndex),
      kindIndex,
      name,
      kindLabel: kindName,
      superCategory,
      subCategory,
      isUnsafe,
      variants,
      selectedVariantIndex,
      subVariantsByVariant,
      selectedSubVariantIndex,
    };
  });
};

const init = async () => {
  await loadUnitIconAssets();
  await loadSpriteVariants();
  catalogItems = await loadCatalogItems();
  applyPreviewIconOverrides(catalogItems);
  buildOrderIdLookup();
  categoryData = buildCategoryData(catalogItems);
  setDefaultCategoryFilters();
  filteredItems = [];
  populateCategoryToggles();
  renderCatalog();
  loadSavedOrders();
  const storedOrderItems = loadCurrentOrder();
  storedOrderItems
    .map((item) => hydrateOrderItem(item))
    .filter(Boolean)
    .forEach((item) => orderItems.push(item));
  renderOrder();
  renderSavedOrders();
  refreshCatalogOrderState();
};

if (unsafeToggle) {
  unsafeToggle.checked = showUnsafeItems;
  unsafeToggle.addEventListener("change", () => {
    showUnsafeItems = unsafeToggle.checked;
    filterCatalog();
  });
}

searchInput.addEventListener("input", filterCatalog);
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  filterCatalog();
});

if (sortSelect) {
  sortSelect.value = sortMode;
  sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    filterCatalog();
  });
}

if (addAllButton) {
  addAllButton.addEventListener("click", () => {
    if (addAllButton.disabled) {
      return;
    }
    addItemsToOrder(filteredItems);
  });
}

clearOrderButton.addEventListener("click", () => {
  orderItems.length = 0;
  renderOrder();
  refreshCatalogOrderState();
});

if (saveOrderButton) {
  saveOrderButton.addEventListener("click", () => saveCurrentOrder());
}

copyOrderButton.addEventListener("click", () => handleCopyAction(copyOrderButton, buildCurrentOrderCommand()));

if (pasteOrderButton) {
  pasteOrderButton.addEventListener("click", () => replaceOrderFromCommand());
}

if (drawerClearButton) {
  drawerClearButton.addEventListener("click", () => {
    orderItems.length = 0;
    renderOrder();
    refreshCatalogOrderState();
  });
}

if (drawerSaveButton) {
  drawerSaveButton.addEventListener("click", () => saveCurrentOrder());
}

if (drawerCopyButton) {
  drawerCopyButton.addEventListener("click", () => handleCopyAction(drawerCopyButton, buildCurrentOrderCommand()));
}

if (orderDrawerToggle) {
  orderDrawerToggle.addEventListener("click", () => {
    isDrawerCollapsed = !isDrawerCollapsed;
    renderOrderDrawer();
  });
}

init();
