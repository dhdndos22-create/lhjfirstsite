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

export const AUTO_SAVE_INTERVAL = 5000;

/* =========================
   게임 밸런스
========================= */

export const GAME_BALANCE = {
  /* 클릭 수익 강화 */
  CLICK_UPGRADE: {
    START_COST: 50,

    /*
      클릭 강화 비용 증가율 공식:

      증가율 =
      BASE_GROWTH +
      강화 레벨 × GROWTH_PER_LEVEL

      Lv.1   = 1.306
      Lv.10  = 1.36
      Lv.20  = 1.42
      Lv.50  = 1.60
      Lv.100 = 1.90
    */
    BASE_GROWTH: 1.3,
    GROWTH_PER_LEVEL: 0.006,

    /*
      지나치게 높은 강화 레벨에서
      비용 배율이 무한히 커지는 것을 막는다.
    */
    MAX_GROWTH: 2.2,

    /*
      현재 기본 클릭 수입의 20% 증가
    */
    INCREASE_RATE: 0.2,
    MIN_INCREASE: 1
  },

  /* 초당 수입 강화 */
  AUTO_UPGRADE: {
    START_COST: 150,

    GROWTH: [
      1.35,
      1.46,
      1.57,
      1.68
    ],

    /*
      현재 기본 초당 수입의 20% 증가
    */
    INCREASE_RATE: 0.2,
    MIN_INCREASE: 1
  },

  /* 메인 레벨업 */
  LEVEL: {
    START_COST: 500,

    GROWTH: [
      1.45,
      1.6,
      1.78,
      1.95
    ]
  }
};

/* =========================
   기본 게임 데이터
========================= */

export const DEFAULT_GAME_STATE = {
  username: "guest",

  money: 0,
  level: 1,

  /*
    강화로 얻은 기본 수입.
    직업·사업·알바 보너스는
    state.js에서 별도로 더한다.
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
    /*
      지금까지 선택한 직업 기록
    */
    selected_jobs: [],

    /*
      직업으로 얻은 누적 보너스
    */
    click_bonus: 0,
    auto_bonus: 0,

    /*
      현재 선택해야 하는 플레이어 레벨.
      선택할 직업이 없으면 null.
    */
    pending_selection_level: null,

    /*
      이미 취업 선택을 완료한
      플레이어 레벨 목록.
    */
    claimed_levels: []
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

  /* 사업 데이터 */
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
  },

  /* 알바 고용 데이터 */
  employeeData: {
    employees: {
      recycler_grandmother: {
        hired: false,
        level: 0
      },

      delivery_driver: {
        hired: false,
        level: 0
      },

      baek_jong_won: {
        hired: false,
        level: 0
      },

      faker: {
        hired: false,
        level: 0
      },

      ronaldo: {
        hired: false,
        level: 0
      }
    },

    total_hired: 0
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
  /* 홀짝게임 */
  oddEven: {
    cooldownMs: 60 * 1000,
    rewardMultiplier: 2
  },

  /* 주사위 게임 */
  dice: {
    cooldownMs: 5 * 60 * 1000,
    rewardMultiplier: 10,

    minNumber: 1,
    maxNumber: 6
  },

  /* 거지로또 */
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

/* =========================
   사업 설정
========================= */

/*
  basePrice:
  첫 구매 가격

  autoIncome:
  사업 1개당 초당 수입

  priceGrowth:
  보유 수량 증가에 따른
  다음 구매 가격 증가율
*/

export const BUILDING_CONFIG = [
  {
    id: "street_stall",
    name: "포장마차",
    icon: "🍢",

    basePrice: 10000,
    autoIncome: 3,

    priceGrowth: 1.15
  },

  {
    id: "small_store",
    name: "구멍가게",
    icon: "🏪",

    basePrice: 50000,
    autoIncome: 13,

    priceGrowth: 1.2
  },

  {
    id: "snack_bar",
    name: "분식집",
    icon: "🍜",

    basePrice: 200000,
    autoIncome: 50,

    priceGrowth: 1.2
  },

  {
    id: "cafe",
    name: "카페",
    icon: "☕",

    basePrice: 1000000,
    autoIncome: 200,

    priceGrowth: 1.2
  },

  {
    id: "restaurant",
    name: "식당",
    icon: "🍽️",

    basePrice: 5000000,
    autoIncome: 833,

    priceGrowth: 1.2
  },

  {
    id: "studio_room",
    name: "원룸",
    icon: "🏠",

    basePrice: 20000000,
    autoIncome: 2667,

    priceGrowth: 1.2
  },

  {
    id: "meat_restaurant",
    name: "고기집",
    icon: "🥩",

    basePrice: 100000000,
    autoIncome: 10000,

    priceGrowth: 1.2
  },

  {
    id: "villa",
    name: "빌라",
    icon: "🏘️",

    basePrice: 500000000,
    autoIncome: 40000,

    priceGrowth: 1.2
  },

  {
    id: "apartment",
    name: "아파트",
    icon: "🏢",

    basePrice: 2000000000,
    autoIncome: 166667,

    priceGrowth: 1.2
  },

  {
    id: "building",
    name: "빌딩",
    icon: "🏙️",

    basePrice: 10000000000,
    autoIncome: 666667,

    priceGrowth: 1.2
  },

  {
    id: "baseball_stadium",
    name: "야구장",
    icon: "⚾",

    basePrice: 50000000000,
    autoIncome: 2666667,

    priceGrowth: 1.2
  },

  {
    id: "soccer_stadium",
    name: "축구장",
    icon: "⚽",

    basePrice: 200000000000,
    autoIncome: 10000000,

    priceGrowth: 1.2
  }
];