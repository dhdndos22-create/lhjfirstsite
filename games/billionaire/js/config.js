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
  /*
    1차 경제 밸런스 목표

    - 하루 20~30분 정도 직접 플레이
    - 나머지 시간은 비접속 수익 20% 적용
    - 첫 1억: 약 7일
    - 첫 1,000억: 약 30일

    실제 도달 시간은 클릭 횟수, 도박 결과,
    구매 순서에 따라 달라질 수 있다.
  */

  /* 터치 수익 강화 */
  CLICK_UPGRADE: {
    START_COST: 50,

    /* 강화 레벨이 높아질수록 비용 증가율도 조금씩 상승 */
    BASE_GROWTH: 1.30,
    GROWTH_PER_LEVEL: 0.006,
    MAX_GROWTH: 2.10,

    /* 현재 기본 터치 수익의 20% 증가 */
    INCREASE_RATE: 0.11,
    MIN_INCREASE: 2
  },

  /* 초당 수입 강화 */
  AUTO_UPGRADE: {
    START_COST: 300,

    /* 터치 강화와 마찬가지로 연속 증가 공식 사용 */
    BASE_GROWTH: 1.28,
    GROWTH_PER_LEVEL: 0.0055,
    MAX_GROWTH: 2.10,

    /* 현재 기본 초당 수입의 18% 증가 */
    INCREASE_RATE: 0.08,
    MIN_INCREASE: 2
  },

  /* 플레이어 레벨 */
  LEVEL: {
    MIN_LEVEL: 1,
    MAX_LEVEL: 200,

    /* 기준점 사이는 로그 보간하여 자연스럽게 증가 */
    COST_ANCHORS: [
      { level: 1, cost: 100 },
      { level: 5, cost: 1000 },
      { level: 10, cost: 50000 },
      { level: 20, cost: 200000 },
      { level: 30, cost: 500000 },
      { level: 40, cost: 1000000 },
      { level: 50, cost: 4500000 },
      { level: 60, cost: 10000000 },
      { level: 70, cost: 25000000 },
      { level: 80, cost: 50000000 },
      { level: 90, cost: 100000000 },
      { level: 100, cost: 200000000 },
      { level: 125, cost: 4000000000 },
      { level: 150, cost: 8000000000 },
      { level: 175, cost: 20000000000 },
      { level: 190, cost: 70000000000 },
      { level: 199, cost: 100000000000 }
    ]
  },

  /* 직업은 Lv.10~100에서 총 10번 선택 */
  JOB: {
    FIRST_LEVEL: 10,
    LAST_LEVEL: 100,
    INTERVAL: 10,

    /* 10레벨 단위마다 직업 보너스가 3배씩 성장 */
    TIER_MULTIPLIER: 2.5
  },

  /* 알바 업그레이드 공통 설정 */
  EMPLOYEE: {
    /* 첫 업그레이드 비용 = 고용비의 70% */
    UPGRADE_BASE_RATE: 0.70
  }
};

/* =========================
   콘텐츠 해금 레벨
========================= */

export const CONTENT_UNLOCK_LEVELS = {
  GAMBLING: 1,
  JOB: 10,
  BUILDING: 20,
  EMPLOYEE: 30
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
    GAME_BALANCE.LEVEL.COST_ANCHORS[0].cost,

  /* 직업 데이터 */
  jobData: {
    /*
      지금까지 선택한 직업 기록
    */
    selected_jobs: [],

    /* 현재 적용 중인 직업 */
    current_job: null,

    /* 현재 직업으로 얻는 보너스 */
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

export const JOB_CHOICES = {
  10: [
    {
      id: "delivery_driver",
      name: "배달기사",
      icon: "🛵",
      clickBonus: 10,
      autoBonus: 0
    },

    {
      id: "server",
      name: "서빙알바",
      icon: "🍽️",
      clickBonus: 0,
      autoBonus: 2
    },

    {
      id: "cook",
      name: "요리사",
      icon: "👨‍🍳",
      clickBonus: 5,
      autoBonus: 1
    }
  ],

  20: [
    {
      id: "used_car_dealer",
      name: "중고차딜러",
      icon: "🚗",
      clickBonus: 35,
      autoBonus: 0
    },

    {
      id: "fitness_trainer",
      name: "헬스 트레이너",
      icon: "🏋️",
      clickBonus: 20,
      autoBonus: 4
    },

    {
      id: "mcdonalds_worker",
      name: "맥도날드 알바",
      icon: "🍔",
      clickBonus: 0,
      autoBonus: 8
    }
  ],

  30: [
    {
      id: "cafe_owner",
      name: "카페 사장",
      icon: "☕",
      clickBonus: 0,
      autoBonus: 25
    },

    {
      id: "pro_gamer",
      name: "프로게이머",
      icon: "🎮",
      clickBonus: 80,
      autoBonus: 0
    }
  ],

  40: [
    {
      id: "baseball_player",
      name: "야구선수",
      icon: "⚾",
      clickBonus: 180,
      autoBonus: 0
    },

    {
      id: "basketball_player",
      name: "농구선수",
      icon: "🏀",
      clickBonus: 100,
      autoBonus: 15
    },

    {
      id: "soccer_player",
      name: "축구선수",
      icon: "⚽",
      clickBonus: 0,
      autoBonus: 35
    }
  ],

  50: [
    {
      id: "national_assembly_member",
      name: "국회의원",
      icon: "🏛️",
      clickBonus: 0,
      autoBonus: 100
    },

    {
      id: "celebrity",
      name: "연예인",
      icon: "🎤",
      clickBonus: 300,
      autoBonus: 30
    },

    {
      id: "million_youtuber",
      name: "100만 유튜버",
      icon: "📹",
      clickBonus: 150,
      autoBonus: 70
    }
  ]
};

/* 직업 설정에 입력된 실제 보너스를 안전하게 반환한다. */
export function calculateJobReward(job) {
  return {
    clickBonus: Math.floor(Number(job.clickBonus) || 0),
    autoBonus: Math.floor(Number(job.autoBonus) || 0)
  };
}

export function getJobChoicesByLevel(level) {
  const safeLevel = Number(level);

  return JOB_CHOICES[safeLevel] || [];
}

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
    incomeGrowth: 1.45,
    upgradeGrowth: 1.75
  },

  {
    id: "delivery_driver",
    name: "배달기사",
    icon: "🛵",

    hireCost: 30000000,
    baseAutoIncome: 400,
    incomeGrowth: 1.47,
    upgradeGrowth: 1.80
  },

  {
    id: "baek_jong_won",
    name: "백종원",
    icon: "👨‍🍳",

    hireCost: 100000000,
    baseAutoIncome: 1200,
    incomeGrowth: 1.50,
    upgradeGrowth: 1.85
  },

  {
    id: "faker",
    name: "페이커",
    icon: "🎮",

    hireCost: 10000000000,
    baseAutoIncome: 15000,
    incomeGrowth: 1.52,
    upgradeGrowth: 1.90
  },

  {
    id: "ronaldo",
    name: "호날두",
    icon: "⚽",

    /* 1,000억 */
    hireCost: 77777777777,
    baseAutoIncome: 77777,
    incomeGrowth: 1.55,
    upgradeGrowth: 1.95
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
    basePrice: 30000,
    autoIncome: 4,
    priceGrowth: 1.22
  },

  {
    id: "small_store",
    name: "구멍가게",
    icon: "🏪",
    basePrice: 150000,
    autoIncome: 15,
    priceGrowth: 1.22
  },

  {
    id: "snack_bar",
    name: "분식집",
    icon: "🍜",
    basePrice: 700000,
    autoIncome: 60,
    priceGrowth: 1.23
  },

  {
    id: "cafe",
    name: "카페",
    icon: "☕",
    basePrice: 3000000,
    autoIncome: 220,
    priceGrowth: 1.23
  },

  {
    id: "restaurant",
    name: "식당",
    icon: "🍽️",
    basePrice: 12000000,
    autoIncome: 800,
    priceGrowth: 1.24
  },

  {
    id: "studio_room",
    name: "원룸",
    icon: "🏠",
    basePrice: 50000000,
    autoIncome: 3000,
    priceGrowth: 1.24
  },

  {
    id: "meat_restaurant",
    name: "고기집",
    icon: "🥩",
    basePrice: 200000000,
    autoIncome: 11000,
    priceGrowth: 1.25
  },

  {
    id: "villa",
    name: "빌라",
    icon: "🏘️",
    basePrice: 1000000000,
    autoIncome: 40000,
    priceGrowth: 1.25
  },

  {
    id: "apartment",
    name: "아파트",
    icon: "🏢",
    basePrice: 5000000000,
    autoIncome: 150000,
    priceGrowth: 1.26
  },

  {
    id: "building",
    name: "빌딩",
    icon: "🏙️",
    basePrice: 25000000000,
    autoIncome: 550000,
    priceGrowth: 1.26
  },

  {
    id: "baseball_stadium",
    name: "야구장",
    icon: "⚾",
    basePrice: 100000000000,
    autoIncome: 2000000,
    priceGrowth: 1.27
  },

  {
    id: "soccer_stadium",
    name: "축구장",
    icon: "⚽",
    basePrice: 400000000000,
    autoIncome: 7000000,
    priceGrowth: 1.28
  }
];
