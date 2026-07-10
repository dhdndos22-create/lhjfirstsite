import {
  SUPABASE_URL,
  SUPABASE_KEY,
  SAVE_TABLE
} from "./config.js";

import {
  state,
  applySaveData,
  createSavePayload,
  getTotalAutoIncome
} from "./state.js";

const supabaseClient =
  globalThis.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

let isSaving = false;
let saveRequestedAgain = false;

/* 저장 데이터 불러오기 */
export async function loadGameData() {
  const { data, error } = await supabaseClient
    .from(SAVE_TABLE)
    .select("*")
    .eq("username", state.username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    await createNewGameData();

    return {
      isNewUser: true,
      lastSavedAt: null
    };
  }

  applySaveData(data);

  return {
    isNewUser: false,
    lastSavedAt: data.last_saved_at
  };
}

/* 신규 유저 저장 데이터 생성 */
async function createNewGameData() {
  const { error } = await supabaseClient
    .from(SAVE_TABLE)
    .insert(createSavePayload());

  if (error) {
    throw error;
  }
}

/* 게임 저장 */
export async function saveGameData() {
  if (!state.username) return;

  if (isSaving) {
    saveRequestedAgain = true;
    return;
  }

  isSaving = true;

  try {
    const { error } = await supabaseClient
      .from(SAVE_TABLE)
      .upsert(
        createSavePayload(),
        {
          onConflict: "username"
        }
      );

    if (error) {
      console.error(
        "Supabase 저장 오류:",
        error
      );
    }
  } finally {
    isSaving = false;

    if (saveRequestedAgain) {
      saveRequestedAgain = false;
      saveGameData();
    }
  }
}

/* 오프라인 수익 계산 */
export async function applyOfflineReward(
  lastSavedAt
) {
  if (!lastSavedAt) return 0;

  const lastTime =
    new Date(lastSavedAt).getTime();

  if (!Number.isFinite(lastTime)) {
    return 0;
  }

  const offlineSeconds = Math.max(
    0,
    Math.floor(
      (Date.now() - lastTime) / 1000
    )
  );

  if (offlineSeconds <= 0) {
    return 0;
  }

  const reward =
    offlineSeconds * getTotalAutoIncome();

  state.money += reward;

  await saveGameData();

  return reward;
}