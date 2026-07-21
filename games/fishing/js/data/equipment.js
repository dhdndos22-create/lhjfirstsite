import { EQUIPMENT_CATEGORIES, RARITIES } from "./game-config.js";

export const EQUIPMENT_DATA = Object.freeze({
 basic_rod:Object.freeze({id:"basic_rod",name:"낡은 낚싯대",category:EQUIPMENT_CATEGORIES.ROD,rarity:RARITIES.NORMAL,description:"처음 지급되는 기본 낚싯대입니다.",image:null,sellPrice:null,stats:Object.freeze({})}),
 good_rod:Object.freeze({id:"good_rod",name:"좋은 낚싯대",category:EQUIPMENT_CATEGORIES.ROD,rarity:RARITIES.RARE,description:"",image:null,sellPrice:null,stats:Object.freeze({})}),
 great_rod:Object.freeze({id:"great_rod",name:"대단한 낚싯대",category:EQUIPMENT_CATEGORIES.ROD,rarity:RARITIES.RARE,description:"",image:null,sellPrice:null,stats:Object.freeze({})})
});
