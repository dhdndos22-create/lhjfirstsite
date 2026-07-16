import {
  SUPABASE_URL,
  SUPABASE_KEY,
  SAVE_TABLE,
  GAME_BALANCE
} from "./config.js";

import {
  state,
  applySaveData,
  createSavePayload,
  getTotalAutoIncome
} from "./state.js";

/* =========================
   Supabase 연결
========================= */

if (!globalThis.supabase) {
  throw new Error(
    "Supabase 라이브러리를 불러오지 못했습니다."
  );
}

const supabaseClient =
  globalThis.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

/* =========================
   저장 상태 관리
========================= */

let isSaving = false;
let saveRequestedAgain = false;

/* =========================
   게임 데이터 불러오기
========================= */

export async function loadGameData() {
  const { data, error } = await supabaseClient
    .from(SAVE_TABLE)
    .select("*")
    .eq("username", state.username)
    .maybeSingle();

  if (error) {
    console.error(
      "Supabase 불러오기 오류:",
      error
    );

    throw error;
  }

  /*
    저장 데이터가 없으면
    현재 기본 상태로 신규 행을 생성한다.
  */
  if (!data) {
    await createNewGameData();

    return {
      isNewUser: true,
      lastSavedAt: null
    };
  }

  /*
    DB 데이터를 state에 적용한다.
    job_data와 gambling_data도
    state.js에서 함께 처리된다.
  */
  const migrationResult =
    applySaveData(data);

  /*
    기존 유저의 저장 데이터에 employee_data가 없거나
    새 알바 항목이 빠져 있으면 현재 설정에 맞게 보완한 뒤
    즉시 Supabase에도 새 구조를 저장한다.
  */
  if (migrationResult?.needsSave) {
    await saveGameData();
  }

  return {
    isNewUser: false,
    lastSavedAt: data.last_saved_at,
    migrated: Boolean(migrationResult?.needsSave)
  };
}

/* =========================
   신규 게임 데이터 생성
========================= */

async function createNewGameData() {
  const payload = createSavePayload();

  const { error } = await supabaseClient
    .from(SAVE_TABLE)
    .insert(payload);

  if (error) {
    /*
      같은 유저의 저장 데이터가
      거의 동시에 생성된 경우에는
      중복 키 오류가 발생할 수 있다.
    */
    if (error.code === "23505") {
      return;
    }

    console.error(
      "신규 게임 데이터 생성 오류:",
      error
    );

    throw error;
  }
}

/* =========================
   게임 데이터 저장
========================= */

export async function saveGameData() {
  if (!state.username) {
    return;
  }

  /*
    저장 중에 또 저장 요청이 들어오면
    현재 저장 완료 후 한 번 더 저장한다.
  */
  if (isSaving) {
    saveRequestedAgain = true;
    return;
  }

  isSaving = true;

  try {
    const payload = createSavePayload();

    const { error } = await supabaseClient
      .from(SAVE_TABLE)
      .upsert(
        payload,
        {
          onConflict: "username"
        }
      );

    if (error) {
      console.error(
        "Supabase 저장 오류:",
        error
      );

      throw error;
    }
  } catch (error) {
    console.error(
      "게임 저장 실패:",
      error
    );
  } finally {
    isSaving = false;

    if (saveRequestedAgain) {
      saveRequestedAgain = false;

      await saveGameData();
    }
  }
}

/* =========================
   오프라인 수익 지급
========================= */

export async function applyOfflineReward(
  lastSavedAt
) {
  if (!lastSavedAt) {
    return {
      reward: 0,
      offlineSeconds: 0
    };
  }

  const lastTime =
    new Date(lastSavedAt).getTime();

  if (!Number.isFinite(lastTime)) {
    return {
      reward: 0,
      offlineSeconds: 0
    };
  }

  const rawOfflineSeconds = Math.max(
    0,
    Math.floor(
      (Date.now() - lastTime) / 1000
    )
  );

  const maxOfflineSeconds =
    Number(GAME_BALANCE.OFFLINE.MAX_HOURS) * 60 * 60;

  const offlineSeconds = Math.min(
    rawOfflineSeconds,
    maxOfflineSeconds
  );

  if (offlineSeconds <= 0) {
    return {
      reward: 0,
      offlineSeconds: 0
    };
  }

  const normalReward =
    offlineSeconds *
    getTotalAutoIncome();

  const offlineReward = Math.floor(
    normalReward *
    Number(GAME_BALANCE.OFFLINE.INCOME_RATE)
  );

  state.money += offlineReward;

  await saveGameData();

  return {
    reward: offlineReward,
    offlineSeconds
  };
}