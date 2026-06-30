const SUPABASE_URL = "https://obyvitczehfjvlrlarwl.supabase.co";
const SUPABASE_KEY = "sb_publishable_dJW__5hVfNLsyl3zVIL0yQ_Arj_PAlX";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const photoDetail = document.getElementById("photoDetail");

const params = new URLSearchParams(window.location.search);
const photoId = params.get("id");

loadPhoto();

async function loadPhoto() {
  if (!photoId) {
    photoDetail.innerHTML = "<p>사진 ID가 없습니다.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .eq("id", photoId)
    .single();

  if (error) {
    console.error(error);
    photoDetail.innerHTML = "<p>사진을 불러오지 못했어.</p>";
    return;
  }

  photoDetail.innerHTML = `
    <div class="photo-detail-card">
      <img src="${data.image}" alt="확대 사진">
      <div class="gallery-info">
        <div class="nickname">👤 ${data.nickname}</div>
        <div class="date">${new Date(data.created_at).toLocaleString("ko-KR")}</div>
      </div>
    </div>
  `;
}