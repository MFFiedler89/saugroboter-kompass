import {searchItems,normalize} from './amazon.mjs';
const seen=new Set();for(const q of ['Kärcher SE 3 Compact','BISSELL SpotClean Pet Pro 15585','Shark StainStriker PX200EUT','BISSELL SpotClean Mini']){for(const it of await searchItems(q,6,1)){const asin=it.asin??it.ASIN;if(seen.has(asin))continue;seen.add(asin);console.log('CANDIDATE '+JSON.stringify({asin,...normalize(it)}));}}
