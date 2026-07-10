export const SUPABASE_URL =
  "https://obyvitczehfjvlrlarwl.supabase.co";

export const SUPABASE_KEY =
  "sb_publishable_dJW__5hVfNLsyl3zVIL0yQ_Arj_PAlX";

export const SAVE_TABLE = "billionaire_saves";

export const AUTO_SAVE_INTERVAL = 5000;

export const DEFAULT_GAME_STATE = {
  username: "guest",

  money: 0,
  level: 1,

  baseClickPower: 1,
  baseAutoIncome: 0,

  clickUpgradeLevel: 0,
  autoUpgradeLevel: 0,

  clickUpgradeCost: 50,
  autoUpgradeCost: 100,
  levelUpCost: 500,

  jobData: {
    level: 1,
    level_up_cost: 100,
    selected_jobs: [],
    click_bonus: 0,
    auto_bonus: 0,
    pending_selection_level: null
  }
};

/*
  현재는 10레벨마다 같은 세 가지 직업이 등장한다.
  나중에는 레벨별 직업 목록으로 쉽게 변경할 수 있다.
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