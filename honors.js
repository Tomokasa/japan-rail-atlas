/* Versioned, editable product rules. No account or network writes. */
(()=>{'use strict';
const rules={version:'honors-low-density-v2',regionThresholdPercent:85,secretMinimumLines:3,regions:[
['hokkaido','北海道','北海道旅客鉄道'],['east','东日本','東日本旅客鉄道'],['central','东海','東海旅客鉄道'],['west','西日本','西日本旅客鉄道'],['shikoku','四国','四国旅客鉄道'],['kyushu','九州','九州旅客鉄道']],
secretDensityThreshold:500,secretLines:window.RAIL_SECRET_LINES};
const tiers=[
['unstarted','岩铁','#33424a','#edf1f3','#9caeb8','#354852'],
['first-trip','赤铜','#623b2c','#f5eee9','#e7b18b','#79432a'],
['walker','青铜','#465331','#eff2e8','#c5ca85','#5c6631'],
['traveler','白银','#3b5368','#edf2f7','#f0f6ff','#73879b'],
['explorer','青钛','#155a61','#e8f4f3','#8cddd5','#287f84'],
['voyager','蓝钢','#244579','#eaf0fa','#94bfff','#315991'],
['cross-islands','紫金','#573b78','#f2ecf8','#d7b1f4','#795098'],
['expert','鎏金','#655018','#faf4e4','#ffe39a','#a87821'],
['complete','虹铂','#433959','#f2edf8','#f6e1ff','#8f789d']
].map(([id,metal,dark,page,light,shade],i)=>({id,metal,dark,page,light,shade,level:i}));
function createEngine(D,config=rules){
const byId=new Map(D.lines.map(l=>[l.id,l]));
const edgesFor=l=>new Set(l.sectionIds.flatMap(id=>D.sections[id].e));
const regionData=config.regions.map(([id,name,operator])=>{const edges=new Set();for(const l of D.lines)if(!l.service&&l.operator===operator)for(const e of edgesFor(l))edges.add(e);return {id,name,operator,edges,totalMm:[...edges].reduce((n,e)=>n+D.edgeLengthsMm[e],0)}});
const secretData=config.secretLines.map(s=>{const allowed=byId.has(s.id)?edgesFor(byId.get(s.id)):new Set();return {...s,edges:new Set((s.edgeIds||[]).filter(e=>allowed.has(e)))}});
function evaluate(ids){const used=new Set(ids);const regions=regionData.map(({edges,...r})=>{let visitedMm=0;for(const e of edges)if(used.has(e))visitedMm+=D.edgeLengthsMm[e];return {...r,visitedMm,ratio:r.totalMm?visitedMm/r.totalMm:0,unlocked:r.totalMm>0&&BigInt(visitedMm)*100n>BigInt(r.totalMm)*BigInt(config.regionThresholdPercent)}});
const secretLines=secretData.map(({edges,...s})=>({...s,visited:[...edges].some(e=>used.has(e)&&D.edgeLengthsMm[e]>0)}));const secretCount=secretLines.filter(s=>s.visited).length;const extraHonors=regions.filter(r=>r.unlocked).map(r=>({id:'region-'+r.id,name:r.name+'踏破'}));if(secretCount>=config.secretMinimumLines)extraHonors.push({id:'secret-explorer',name:'秘境铁路探险家'});
return {ruleVersion:config.version,regions,secretLines,secretCount,secretMinimumLines:config.secretMinimumLines,extraHonors};}
return {evaluate};}
const medal='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M14 8h12v21H14zM14 15h12M14 23h12M11 33l5-5m13 5-5-5M19 11h2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="17" cy="26" r="1"/><circle cx="23" cy="26" r="1"/></svg>';
function applyTheme(t,root=document.body){for(const [k,v] of Object.entries({dark:t.dark,page:t.page,light:t.light,shade:t.shade}))root.style.setProperty('--rank-'+k,v);root.dataset.rank=t.id;}
function render(result,title){const tier=tiers.find(t=>t.id===title.id)||tiers[0];applyTheme(tier);const medalNode=document.querySelector('#rank-medal');medalNode.innerHTML=medal;medalNode.title=tier.metal+'徽章 · '+title.name;document.querySelector('#rank-metal').textContent=tier.metal+' · 综合等级 '+tier.level;
const extras=document.querySelector('#extra-honors');extras.replaceChildren();for(const h of result.extraHonors){const el=document.createElement('span');el.className='extra-honor';el.textContent=h.name;extras.append(el)}
const regions=document.querySelector('#region-progress');regions.replaceChildren();for(const r of result.regions){const item=document.createElement('div');item.className='region-card'+(r.unlocked?' unlocked':'');const label=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');name.textContent=r.name;value.textContent=(r.ratio*100).toFixed(2)+'%';label.append(name,value);const bar=document.createElement('progress');bar.max=100;bar.value=r.ratio*100;bar.setAttribute('aria-label',r.name+'踏破率');const note=document.createElement('small');note.textContent=(r.visitedMm/1e6).toFixed(1)+' / '+(r.totalMm/1e6).toFixed(1)+' km';item.title=r.operator+(r.unlocked?' · 已获踏破荣誉':' · 超过85%获得踏破荣誉');item.append(label,bar,note);regions.append(item)}
document.querySelector('#secret-progress').textContent='秘境线路 '+result.secretCount+' / '+result.secretMinimumLines+' 条'+(result.secretCount>=result.secretMinimumLines?' · 已解锁':'');}

window.RailHonors={rules,tiers,createEngine,render,applyTheme,medal};
})();
