const SUPABASE_URL = "https://obyvitczehfjvlrlarwl.supabase.co";
const SUPABASE_KEY = "sb_publishable_dJW__5hVfNLsyl3zVIL0yQ_Arj_PAlX";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const nicknameInput = document.getElementById("nicknameInput");
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const statusText = document.getElementById("statusText");
const galleryList = document.getElementById("galleryList");

let currentPage = 1;
const itemsPerPage = 4;
let totalItems = 0;

uploadBtn.addEventListener("click", uploadImage);

loadGallery();

async function uploadImage() {
  const nickname = nicknameInput.value.trim();
  const file = imageInput.files[0];

  if (!nickname) {
    statusText.textContent = "닉네임을 입력해줘!";
    return;
  }

  if (!file) {
    statusText.textContent = "사진을 선택해줘!";
    return;
  }

  if (!file.type.startsWith("image/")) {
    statusText.textContent = "이미지 파일만 업로드할 수 있어!";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    statusText.textContent = "사진은 5MB 이하만 가능해!";
    return;
  }

  statusText.textContent = "업로드 중...";
  uploadBtn.disabled = true;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("gallery")
    .upload(filePath, file);

  if (uploadError) {
    console.error(uploadError);
    statusText.textContent = "사진 업로드 실패!";
    uploadBtn.disabled = false;
    return;
  }

  const { data: urlData } = supabaseClient.storage
    .from("gallery")
    .getPublicUrl(filePath);

  const imageUrl = urlData.publicUrl;

  const { error: dbError } = await supabaseClient
    .from("gallery")
    .insert([
      {
        image: imageUrl,
        nickname: nickname
      }
    ]);

  if (dbError) {
    console.error(dbError);
    statusText.textContent = "DB 저장 실패!";
    uploadBtn.disabled = false;
    return;
  }

  statusText.textContent = "업로드 완료!";
  nicknameInput.value = "";
  imageInput.value = "";
  uploadBtn.disabled = false;

  currentPage = 1;
  loadGallery();
}

async function loadGallery() {
  galleryList.innerHTML = "";

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, error, count } = await supabaseClient
    .from("gallery")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    galleryList.innerHTML = "<p>갤러리를 불러오지 못했어.</p>";
    return;
  }

  totalItems = count || 0;

  if (!data || data.length === 0) {
    galleryList.innerHTML = "<p>아직 업로드된 사진이 없어.</p>";
    renderPagination();
    return;
  }

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "gallery-card";

    const date = new Date(item.created_at).toLocaleString("ko-KR");

    card.innerHTML = `
      <img src="${item.image}" alt="갤러리 사진">
      <div class="gallery-info">
        <div class="nickname">👤 ${item.nickname}</div>
        <div class="date">${date}</div>
      </div>
    `;

    card.addEventListener("click", function () {
      location.href = `photo.html?id=${item.id}`;
    });

    galleryList.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  let pagination = document.getElementById("pagination");

  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.className = "pagination";
    galleryList.after(pagination);
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let buttons = "";

  for (let i = 1; i <= totalPages; i++) {
    buttons += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = buttons;
}

function goToPage(page) {
  currentPage = page;
  loadGallery();
}