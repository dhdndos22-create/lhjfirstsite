import { PET_CONFIG } from "./config.js";
import { state, getEquippedPet } from "./state.js";
import { elements, updateMainUI, formatMoney } from "./ui.js";
import { saveGameData } from "./database.js";
import { showConfirm } from "./confirm.js";

let ui;
export function initializePet() {
  ui = {
    menu: document.getElementById("petMenuBtn"),
    panel: document.getElementById("petPanel"),
    close: document.getElementById("petPanelCloseBtn"),
    list: document.getElementById("petList"),
    equipped: document.getElementById("petEquippedText"),
    count: document.getElementById("petOwnedCountText")
  };
  if (Object.values(ui).some(v => !v)) return console.error("펫 HTML 요소가 없습니다.");
  ui.menu.addEventListener("click", openPetPanel);
  ui.close.addEventListener("click", () => ui.panel.classList.add("hidden"));
  ui.panel.addEventListener("click", e => e.stopPropagation());
  renderPetList(); updatePetUI();
}
function openPetPanel(e) {
  e.stopPropagation();
  elements.gameMenuPanel.classList.add("hidden");
  ui.panel.classList.remove("hidden");
  renderPetList(); updatePetUI();
}
export function updatePetUI() {
  if (!ui) return;
  const equipped = getEquippedPet();
  ui.equipped.textContent = equipped ? `${equipped.icon} ${equipped.name}` : "없음";
  ui.count.textContent = `${state.petData.owned.length} / ${PET_CONFIG.length}마리`;
  renderPetList();
}
function effectText(pet) {
  const parts=[];
  if (pet.clickRate) parts.push(`총 클릭 수입 +${pet.clickRate*100}%`);
  if (pet.autoRate) parts.push(`총 초당 수입 +${pet.autoRate*100}%`);
  return parts.join(" · ");
}
function renderPetList() {
  if (!ui) return;
  ui.list.innerHTML="";
  PET_CONFIG.forEach(pet => {
    const owned=state.petData.owned.includes(pet.id);
    const equipped=state.petData.equipped_pet_id===pet.id;
    const card=document.createElement("div"); card.className="standardCard petCard";
    card.innerHTML=`<div class="petIcon">${pet.icon}</div><h3>${pet.name}</h3><p>${pet.species}</p><strong class="petEffect">${effectText(pet)}</strong><p>가격: ${formatMoney(pet.price)}</p>`;
    const btn=document.createElement("button"); btn.className="standardPrimaryBtn";
    if (!owned) { btn.textContent=`구매 (${formatMoney(pet.price)})`; btn.disabled=state.money<pet.price; btn.onclick=()=>buyPet(pet); }
    else if (equipped) { btn.textContent="장착 중"; btn.disabled=true; }
    else { btn.textContent="장착하기"; btn.onclick=()=>equipPet(pet); }
    card.appendChild(btn); ui.list.appendChild(card);
  });
}
async function buyPet(pet) {
  if (state.money < pet.price || state.petData.owned.includes(pet.id)) return;
  const ok=await showConfirm({ icon: pet.icon, title: `${pet.name} 구매`, message: `${pet.name}을(를) 구매할까요?`, detail: `가격 ${formatMoney(pet.price)} · ${effectText(pet)}` });
  if (!ok || state.money < pet.price) return;
  state.money-=pet.price; state.petData.owned.push(pet.id); state.petData.total_purchases=state.petData.owned.length;
  if (!state.petData.equipped_pet_id) state.petData.equipped_pet_id=pet.id;
  updateMainUI(); updatePetUI(); await saveGameData();
}
async function equipPet(pet) {
  if (!state.petData.owned.includes(pet.id)) return;
  state.petData.equipped_pet_id=pet.id; updateMainUI(); updatePetUI(); await saveGameData();
}
