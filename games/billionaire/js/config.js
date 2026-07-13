/* =========================
   Supabase 설정
========================= */

export const SUPABASE_URL =
  "https://obyvitczehfjvlrlarwl.supabase.co";

export const SUPABASE_KEY =
  "sb_publishable_dJW__5hVfNLsyl3zVIL0yQ_Arj_PAlX";

export const SAVE_TABLE =
  "billionaire_saves";

/* =========================
   공통 게임 설정
========================= */

export const AUTO_SAVE_INTERVAL =
  5000;

/* =========================
   기본 게임 데이터
========================= */

export const GAME_BALANCE = {

  /*
    강화
  */

  CLICK_UPGRADE: {

    START_COST: 50,

    GROWTH: [
      1.32,
      1.42,
      1.52,
      1.62
    ],

    BONUS_INTERVAL: 25
  },



  AUTO_UPGRADE: {

    START_COST: 150,

    GROWTH: [
      1.35,
      1.46,
      1.57,
      1.68
    ],

    BONUS_INTERVAL: 30
  },



  LEVEL: {

    START_COST: 500,

    GROWTH: [
      1.45,
      1.60,
      1.78,
      1.95
    ]
  }

};



export const DEFAULT_GAME_STATE = {
  username: "guest",

  money: 0,
  level: 1,

  /*
    강화로 얻는 기본 수입.
    직업·건물 등 콘텐츠 보너스는
    별도로 더해서 계산한다.
  */
  baseClickPower: 1,
  baseAutoIncome: 0,

  clickUpgradeLevel: 0,
  autoUpgradeLevel: 0,

  clickUpgradeCost:
    GAME_BALANCE.CLICK_UPGRADE.START_COST,

  autoUpgradeCost:
    GAME_BALANCE.AUTO_UPGRADE.START_COST,

  levelUpCost:
    GAME_BALANCE.LEVEL.START_COST,


  /* 직업 데이터 */
  jobData: {
    level: 1,
    level_up_cost: 100,

    selected_jobs: [],

    click_bonus: 0,
    auto_bonus: 0,

    pending_selection_level: null
  },

  /* 도박 데이터 */
  gamblingData: {
    odd_even_last_played_at: null,
    dice_last_played_at: null,
    beggar_lottery_last_bought_at: null,

    lottery: {
      beggar_ticket_count: 0,
      beggar_total_spent: 0,
      beggar_total_won: 0
    },

    stats: {
      odd_even_plays: 0,
      odd_even_wins: 0,

      dice_plays: 0,
      dice_wins: 0
    }
  },

  /* 건물 데이터 */
  buildingData: {
    owned: {
      street_stall: 0,
      small_store: 0,
      snack_bar: 0,
      cafe: 0,
      restaurant: 0,
      studio_room: 0,
      meat_restaurant: 0,
      villa: 0,
      apartment: 0,
      building: 0,
      baseball_stadium: 0,
      soccer_stadium: 0
    },

    total_purchases: 0
  }
};

/* =========================
   직업 선택지
========================= */

export const JOB_CHOICES = [
  {
    id: "delivery_driver",
    name: "배달기사",
    icon: "🛵",
    clickBonus: 1000,
    autoBonus: 0
  },

  {
    id: "server",
    name: "서빙알바",
    icon: "🍽️",
    clickBonus: 0,
    autoBonus: 100
  },

  {
    id: "cook",
    name: "요리사",
    icon: "👨‍🍳",
    clickBonus: 500,
    autoBonus: 50
  }
];

/* =========================
   도박 게임 설정
========================= */

export const GAMBLING_CONFIG = {
  oddEven: {
    cooldownMs: 60 * 1000,
    rewardMultiplier: 2
  },

  dice: {
    cooldownMs: 5 * 60 * 1000,
    rewardMultiplier: 10,
    minNumber: 1,
    maxNumber: 6
  },

  beggarLottery: {
    price: 5000,
    cooldownMs: 3 * 60 * 1000,

    rewards: [
      {
        min: 0,
        max: 30,
        reward: 0,
        label: "꽝"
      },

      {
        min: 30,
        max: 70,
        reward: 10000,
        label: "10,000원 당첨"
      },

      {
        min: 70,
        max: 90,
        reward: 20000,
        label: "20,000원 당첨"
      },

      {
        min: 90,
        max: 95,
        reward: 50000,
        label: "50,000원 당첨"
      },

      {
        min: 95,
        max: 100,
        reward: 100000,
        label: "100,000원 당첨"
      }
    ]
  }
};

/* =========================
   건물 설정
========================= */

/*
  basePrice:
  첫 번째 건물 구매 가격

  autoIncome:
  건물 1개당 초당 수입

  priceGrowth:
  보유 개수가 늘어날 때마다
  다음 구매 가격에 적용되는 배율
*/

/* =========================
   알바 설정
========================= */

export const EMPLOYEE_CONFIG = [
  {
    id: "recycler_grandmother",
    name: "폐지줍는 할머니",
    icon: "👵",
    hireCost: 1000000,
    baseAutoIncome: 100,
    upgradeGrowth: 1.6
  },

  {
    id: "delivery_driver",
    name: "배달기사",
    icon: "🛵",
    hireCost: 50000000,
    baseAutoIncome: 3000,
    upgradeGrowth: 1.65
  },

  {
    id: "baek_jong_won",
    name: "백종원",
    icon: "👨‍🍳",
    hireCost: 1000000000,
    baseAutoIncome: 40000,
    upgradeGrowth: 1.7
  },

  {
    id: "faker",
    name: "페이커",
    icon: "🎮",
    hireCost: 100000000000,
    baseAutoIncome: 250000,
    upgradeGrowth: 1.75
  },

  {
    id: "ronaldo",
    name: "호날두",
    icon: "⚽",
    hireCost: 1000000000000,
    baseAutoIncome: 1500000,
    upgradeGrowth: 1.8
  }
];

export const BUILDING_CONFIG = [
  {
    id: "street_stall",
    name: "포장마차",
    icon: "🍢",
    basePrice: 10000,
    autoIncome: 10,
    priceGrowth: 1.15
  },

  {
    id: "small_store",
    name: "구멍가게",
    icon: "🏪",
    basePrice: 50000,
    autoIncome: 40,
    priceGrowth: 1.15
  },

  {
    id: "snack_bar",
    name: "분식집",
    icon: "🍜",
    basePrice: 200000,
    autoIncome: 150,
    priceGrowth: 1.15
  },

  {
    id: "cafe",
    name: "카페",
    icon: "☕",
    basePrice: 1000000,
    autoIncome: 600,
    priceGrowth: 1.15
  },

  {
    id: "restaurant",
    name: "식당",
    icon: "🍽️",
    basePrice: 5000000,
    autoIncome: 2500,
    priceGrowth: 1.15
  },

  {
    id: "studio_room",
    name: "원룸",
    icon: "🏠",
    basePrice: 20000000,
    autoIncome: 8000,
    priceGrowth: 1.15
  },

  {
    id: "meat_restaurant",
    name: "고기집",
    icon: "🥩",
    basePrice: 100000000,
    autoIncome: 30000,
    priceGrowth: 1.15
  },

  {
    id: "villa",
    name: "빌라",
    icon: "🏘️",
    basePrice: 500000000,
    autoIncome: 120000,
    priceGrowth: 1.15
  },

  {
    id: "apartment",
    name: "아파트",
    icon: "🏢",
    basePrice: 2000000000,
    autoIncome: 500000,
    priceGrowth: 1.15
  },

  {
    id: "building",
    name: "빌딩",
    icon: "🏙️",
    basePrice: 10000000000,
    autoIncome: 2000000,
    priceGrowth: 1.15
  },

  {
    id: "baseball_stadium",
    name: "야구장",
    icon: "⚾",
    basePrice: 50000000000,
    autoIncome: 8000000,
    priceGrowth: 1.15
  },

  {
    id: "soccer_stadium",
    name: "축구장",
    icon: "⚽",
    basePrice: 200000000000,
    autoIncome: 30000000,
    priceGrowth: 1.15
  }
];

/* ===========================
   게임 밸런스
=========================== */

