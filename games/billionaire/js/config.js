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

export const DEFAULT_GAME_STATE = {
  username: "guest",

  money: 0,
  level: 1,

  /*
    강화로 얻는 기본 수입.
    직업이나 다른 콘텐츠 보너스는
    별도로 더해서 계산한다.
  */
  baseClickPower: 1,
  baseAutoIncome: 0,

  clickUpgradeLevel: 0,
  autoUpgradeLevel: 0,

  clickUpgradeCost: 50,
  autoUpgradeCost: 100,
  levelUpCost: 500,

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
  }
};

/* =========================
   직업 선택지
========================= */

/*
  현재는 직업 레벨 10, 20, 30마다
  동일한 세 직업이 표시된다.

  나중에는 레벨별 직업 선택지로
  구조를 변경할 수 있다.
*/

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

    /*
      베팅금은 먼저 차감한다.
      성공하면 베팅금의 2배를 지급한다.

      예:
      10,000원 베팅
      → 먼저 10,000원 차감
      → 성공 시 20,000원 지급
      → 최종 순이익 10,000원
    */
    rewardMultiplier: 2
  },

  /* 주사위 게임 */
  dice: {
    cooldownMs: 5 * 60 * 1000,

    /*
      성공 시 베팅금의 10배 지급.
      베팅금은 게임 시작 전에 먼저 차감한다.
    */
    rewardMultiplier: 10,

    minNumber: 1,
    maxNumber: 6
  },

  /* 거지로또 */
  beggarLottery: {
    price: 5000,

    cooldownMs: 3 * 60 * 1000,

    /*
      0 이상 100 미만의 난수를 만든 뒤
      아래 구간에 따라 보상을 지급한다.

      0~30   : 꽝 30%
      30~70  : 10,000원 40%
      70~90  : 20,000원 20%
      90~95  : 50,000원 5%
      95~100 : 100,000원 5%
    */
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