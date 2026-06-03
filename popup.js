(() => {
"use strict";
const $=s=>document.querySelector(s);
const formulas=Object.freeze([
{id:"fma",cat:"Physics",name:"Newton's Second Law",formula:"F = m × a",desc:"Force from mass and acceleration.",keys:"force newton mass acceleration"},
{id:"ke",cat:"Physics",name:"Kinetic Energy",formula:"KE = ½mv²",desc:"Energy of moving objects.",keys:"kinetic energy velocity"},
{id:"pe",cat:"Physics",name:"Potential Energy",formula:"PE = mgh",desc:"Stored gravitational energy.",keys:"potential height gravity"},
{id:"wave",cat:"Physics",name:"Wave Speed",formula:"v = fλ",desc:"Wave speed from frequency and wavelength.",keys:"wave frequency wavelength"},
{id:"pressure",cat:"Physics",name:"Pressure",formula:"P = F / A",desc:"Force per unit area.",keys:"pressure force area"},
{id:"density",cat:"Chemistry",name:"Density",formula:"ρ = m / V",desc:"Mass per unit volume.",keys:"density mass volume"},
{id:"moles",cat:"Chemistry",name:"Moles",formula:"n = m / M",desc:"Amount of substance.",keys:"moles molar mass"},
{id:"gas",cat:"Chemistry",name:"Ideal Gas Law",formula:"PV = nRT",desc:"Pressure-volume-temperature gas relation.",keys:"gas pressure volume temp"},
{id:"ph",cat:"Chemistry",name:"pH",formula:"pH = -log[H⁺]",desc:"Acidity measurement.",keys:"acid base hydrogen ph"},
{id:"ohm",cat:"Electronics",name:"Ohm's Law",formula:"V = I × R",desc:"Voltage-current-resistance relationship.",keys:"voltage current resistance"},
{id:"power",cat:"Electronics",name:"Electrical Power",formula:"P = V × I",desc:"Electric power in watts.",keys:"power watt"},
{id:"series",cat:"Electronics",name:"Series Resistance",formula:"Rₜ = R₁ + R₂ + ...",desc:"Total resistance in series.",keys:"resistor series"},
{id:"parallel",cat:"Electronics",name:"Parallel Resistance",formula:"1/Rₜ = 1/R₁ + 1/R₂ + ...",desc:"Total resistance in parallel.",keys:"resistor parallel"},
{id:"speed",cat:"Motion",name:"Speed",formula:"v = d / t",desc:"Distance divided by time.",keys:"speed distance time"},
{id:"acc",cat:"Motion",name:"Acceleration",formula:"a = Δv / Δt",desc:"Velocity change per time.",keys:"acceleration velocity"},
{id:"circle",cat:"Math",name:"Circle Area",formula:"A = πr²",desc:"Area of a circle.",keys:"circle area radius"},
{id:"py",cat:"Math",name:"Pythagorean Theorem",formula:"a² + b² = c²",desc:"Right triangle side relation.",keys:"triangle pythagoras"},
{id:"quad",cat:"Math",name:"Quadratic Formula",formula:"x = (-b ± √(b²-4ac)) / 2a",desc:"Solves ax²+bx+c=0.",keys:"quadratic algebra"},
{id:"binary",cat:"Computing",name:"Binary Values",formula:"2ⁿ values",desc:"n bits can represent 2ⁿ values.",keys:"binary bits computing"},
{id:"data",cat:"Computing",name:"Data Transfer Time",formula:"time = data size / bandwidth",desc:"Estimate transfer duration.",keys:"network data bandwidth"}
]);
const constants=Object.freeze([
["Speed of light","c","299,792,458 m/s"],["Gravitational constant","G","6.67430 × 10⁻¹¹ N·m²/kg²"],
["Planck constant","h","6.62607015 × 10⁻³⁴ J·s"],["Avogadro constant","Nₐ","6.02214076 × 10²³ mol⁻¹"],
["Gas constant","R","8.314462618 J/(mol·K)"],["Elementary charge","e","1.602176634 × 10⁻¹⁹ C"],
["Pi","π","3.141592653589793"],["Euler number","e","2.718281828459045"]
]);
const units=Object.freeze({
Length:{mm:.001,cm:.01,m:1,km:1000,inch:.0254,ft:.3048,yd:.9144,mile:1609.344},
Mass:{mg:1e-6,g:.001,kg:1,tonne:1000,oz:.028349523125,lb:.45359237},
Time:{ms:.001,s:1,min:60,hr:3600,day:86400,week:604800},
Speed:{"m/s":1,"km/h":.2777777778,mph:.44704,knots:.514444},
Area:{"cm²":.0001,"m²":1,"km²":1e6,acre:4046.8564224,hectare:10000},
Volume:{mL:1e-6,L:.001,"m³":1,"cm³":1e-6,gallon:.003785411784},
Energy:{J:1,kJ:1000,cal:4.184,kcal:4184,Wh:3600,kWh:3600000},
Pressure:{Pa:1,kPa:1000,bar:100000,atm:101325,psi:6894.757293},
Temperature:{Celsius:"c",Fahrenheit:"f",Kelvin:"k"}
});
const state={cat:"All",saved:new Set(),theme:"light",history:[]};
const els={
search:$("#globalSearch"),chips:$("#categoryChips"),formulaList:$("#formulaList"),constantList:$("#constantList"),savedList:$("#savedList"),
tabs:document.querySelectorAll(".tab"),panels:document.querySelectorAll(".panel"),themeBtn:$("#themeBtn"),clearBtn:$("#clearBtn"),
calcInput:$("#calcInput"),calcResult:$("#calcResult"),bmiWeight:$("#bmiWeight"),bmiHeight:$("#bmiHeight"),bmiResult:$("#bmiResult"),
ohmV:$("#ohmV"),ohmI:$("#ohmI"),ohmR:$("#ohmR"),ohmSolve:$("#ohmSolve"),ohmResult:$("#ohmResult"),
unitType:$("#unitType"),unitValue:$("#unitValue"),fromUnit:$("#fromUnit"),toUnit:$("#toUnit"),unitResult:$("#unitResult"),history:$("#history")
};
const store={async get(d){try{return await chrome.storage.local.get(d)}catch{return d}},async set(d){try{await chrome.storage.local.set(d)}catch{}}};
function num(n){return Number.isFinite(n)?(Math.abs(n)>=1e8||Math.abs(n)<1e-5&&n!==0?n.toExponential(6):Number(n.toPrecision(10)).toString()):"Invalid"}
function empty(t){const d=document.createElement("div");d.className="empty";d.textContent=t;return d}
function btn(c,t,data){const b=document.createElement("button");b.type="button";b.className=c;b.textContent=t;Object.entries(data||{}).forEach(([k,v])=>b.dataset[k]=v);return b}
function card(f){const a=document.createElement("article");a.className="card";const top=document.createElement("div");top.className="card-top";
const info=document.createElement("div");const tag=document.createElement("span");tag.className="tag";tag.textContent=f.cat||"Constant";const h=document.createElement("h2");h.textContent=f.name;info.append(tag,h);
const acts=document.createElement("div");acts.className="actions";acts.append(btn("mini","⧉",{copy:f.formula||f.value}),btn("mini"+(state.saved.has(f.id)?" saved":""),"★",{save:f.id||""}));
top.append(info,acts);const fo=document.createElement("div");fo.className="formula";fo.textContent=f.formula||`${f.symbol} = ${f.value}`;const p=document.createElement("p");p.className="desc";p.textContent=f.desc||"Scientific constant.";a.append(top,fo,p);return a}
function renderChips(){const cats=["All",...new Set(formulas.map(f=>f.cat))],frag=document.createDocumentFragment();cats.forEach(c=>frag.append(btn("chip"+(c===state.cat?" active":""),c,{cat:c})));els.chips.replaceChildren(frag)}
function filterFormulas(){const q=els.search.value.trim().toLowerCase();return formulas.filter(f=>(state.cat==="All"||f.cat===state.cat)&&(!q||`${f.name} ${f.formula} ${f.desc} ${f.keys}`.toLowerCase().includes(q)))}
function renderFormulas(){const arr=filterFormulas(),frag=document.createDocumentFragment();arr.forEach(f=>frag.append(card(f)));els.formulaList.replaceChildren(arr.length?frag:empty("No matching formulas."))}
function renderConstants(){const q=els.search.value.trim().toLowerCase();const arr=constants.map((c,i)=>({id:"c"+i,name:c[0],symbol:c[1],value:c[2],cat:"Constant",formula:`${c[1]} = ${c[2]}`})).filter(c=>!q||`${c.name} ${c.symbol} ${c.value}`.toLowerCase().includes(q));const frag=document.createDocumentFragment();arr.forEach(c=>frag.append(card(c)));els.constantList.replaceChildren(arr.length?frag:empty("No matching constants."))}
function renderSaved(){const all=[...formulas,...constants.map((c,i)=>({id:"c"+i,name:c[0],symbol:c[1],value:c[2],cat:"Constant",formula:`${c[1]} = ${c[2]}`}))];const arr=all.filter(x=>state.saved.has(x.id));const frag=document.createDocumentFragment();arr.forEach(x=>frag.append(card(x)));els.savedList.replaceChildren(arr.length?frag:empty("Nothing saved yet."))}
function renderAll(){renderChips();renderFormulas();renderConstants();renderSaved()}
function setupUnits(){const frag=document.createDocumentFragment();Object.keys(units).forEach(k=>{const o=document.createElement("option");o.value=k;o.textContent=k;frag.append(o)});els.unitType.replaceChildren(frag);refreshUnits()}
function refreshUnits(){const keys=Object.keys(units[els.unitType.value]);const a=document.createDocumentFragment(),b=document.createDocumentFragment();keys.forEach(k=>{let o=document.createElement("option");o.value=k;o.textContent=k;a.append(o);b.append(o.cloneNode(true))});els.fromUnit.replaceChildren(a);els.toUnit.replaceChildren(b);els.toUnit.selectedIndex=Math.min(1,keys.length-1);convert()}
function tToC(v,u){return u==="Fahrenheit"?(v-32)*5/9:u==="Kelvin"?v-273.15:v}
function cToT(v,u){return u==="Fahrenheit"?v*9/5+32:u==="Kelvin"?v+273.15:v}
function convert(){const v=Number(els.unitValue.value),type=els.unitType.value,from=els.fromUnit.value,to=els.toUnit.value;if(!Number.isFinite(v)){els.unitResult.textContent="Enter valid number";return}let out;if(type==="Temperature")out=cToT(tToC(v,from),to);else out=v*units[type][from]/units[type][to];const text=`${num(out)} ${to}`;els.unitResult.textContent=text;if(state.history[0]!==`${v} ${from} → ${text}`){state.history.unshift(`${v} ${from} → ${text}`);state.history=state.history.slice(0,4);renderHistory()}}
function renderHistory(){els.history.replaceChildren(...state.history.map(x=>{const d=document.createElement("div");d.textContent=x;return d}))}
function safeCalc(){let s=els.calcInput.value.trim().toLowerCase();if(!s){els.calcResult.textContent="0";return}s=s.replace(/×/g,"*").replace(/÷/g,"/").replace(/\^/g,"**").replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E")
.replace(/\bsqrt\(/g,"Math.sqrt(").replace(/\blog\(/g,"Math.log10(").replace(/\bln\(/g,"Math.log(")
.replace(/\bsin\(/g,"sinD(").replace(/\bcos\(/g,"cosD(").replace(/\btan\(/g,"tanD(");
if(!/^[0-9+\-*/().,\s*MathPIEsqrtlogincotaD]+$/.test(s)){els.calcResult.textContent="Unsupported input";return}
try{const sinD=x=>Math.sin(x*Math.PI/180),cosD=x=>Math.cos(x*Math.PI/180),tanD=x=>Math.tan(x*Math.PI/180);const r=Function("sinD","cosD","tanD",`"use strict";return (${s})`)(sinD,cosD,tanD);els.calcResult.textContent=num(r)}catch{els.calcResult.textContent="Check expression"}}
function bmi(){const w=Number(els.bmiWeight.value),h=Number(els.bmiHeight.value)/100;if(!w||!h){els.bmiResult.textContent="Enter weight and height";return}const b=w/(h*h);els.bmiResult.textContent=`BMI: ${num(b)}`}
function ohm(){const V=Number(els.ohmV.value),I=Number(els.ohmI.value),R=Number(els.ohmR.value),hasV=Number.isFinite(V)&&els.ohmV.value!=="",hasI=Number.isFinite(I)&&els.ohmI.value!=="",hasR=Number.isFinite(R)&&els.ohmR.value!=="";let msg="Fill any two values";if(!hasV&&hasI&&hasR)msg=`V = ${num(I*R)} V`;else if(hasV&&!hasI&&hasR)msg=`I = ${num(V/R)} A`;else if(hasV&&hasI&&!hasR)msg=`R = ${num(V/I)} Ω`;els.ohmResult.textContent=msg}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch{}}
async function toggleSave(id){if(!id)return;state.saved.has(id)?state.saved.delete(id):state.saved.add(id);await store.set({saved:[...state.saved]});renderAll()}
async function theme(){state.theme=state.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=state.theme;await store.set({theme:state.theme})}
function bind(){
els.tabs.forEach(t=>t.addEventListener("click",()=>{els.tabs.forEach(x=>x.classList.remove("active"));els.panels.forEach(x=>x.classList.remove("active"));t.classList.add("active");$("#"+t.dataset.tab).classList.add("active")}));
els.chips.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;state.cat=b.dataset.cat;renderAll()});
document.addEventListener("click",e=>{const c=e.target.closest("[data-copy]"),s=e.target.closest("[data-save]");if(c)copy(c.dataset.copy);if(s)toggleSave(s.dataset.save)});
els.search.addEventListener("input",renderAll);els.themeBtn.addEventListener("click",theme);els.clearBtn.addEventListener("click",async()=>{state.saved.clear();await store.set({saved:[]});renderAll()});
els.unitType.addEventListener("change",refreshUnits);[els.unitValue,els.fromUnit,els.toUnit].forEach(x=>x.addEventListener("input",convert));els.fromUnit.addEventListener("change",convert);els.toUnit.addEventListener("change",convert);
els.calcInput.addEventListener("input",safeCalc);[els.bmiWeight,els.bmiHeight].forEach(x=>x.addEventListener("input",bmi));els.ohmSolve.addEventListener("click",ohm)
}
async function init(){const d=await store.get({saved:[],theme:"light"});state.saved=new Set(Array.isArray(d.saved)?d.saved:[]);state.theme=d.theme==="dark"?"dark":"light";document.documentElement.dataset.theme=state.theme;setupUnits();renderAll();bind()}
document.addEventListener("DOMContentLoaded",init);
})();