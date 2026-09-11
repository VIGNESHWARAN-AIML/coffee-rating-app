const API = "http://localhost:3000/api";
let selectedRating = 5;

const fallbackCoffees = [
  {name:"Cinnamon Cloud Latte",type:"Latte",rating:4.9,reviews:42},
  {name:"Midnight Espresso",type:"Espresso",rating:4.8,reviews:36},
  {name:"Velvet Mocha",type:"Mocha",rating:4.7,reviews:29}
];
const fallbackReviews = [
  {name:"Aarav",rating:5,comment:"Rich aroma, silky texture and a beautifully balanced finish.",date:"Today"},
  {name:"Maya",rating:4.5,comment:"Loved the creamy body. The cinnamon note really came through.",date:"Yesterday"},
  {name:"Kavin",rating:4.8,comment:"A seriously good afternoon cup. Smooth without being too sweet.",date:"2 days ago"}
];

document.addEventListener("DOMContentLoaded",()=>{
  setupStars(); setupSliders(); observeReveal(); animateCounts(); loadCoffees(); loadReviews(); setupChart();
});

async function getJSON(url, fallback){
  try{const r=await fetch(url); if(!r.ok) throw new Error(); return await r.json();}
  catch{return fallback;}
}
async function loadCoffees(){
  const data=await getJSON(`${API}/coffees`,fallbackCoffees);
  document.querySelector("#coffeeGrid").innerHTML=data.map((c,i)=>`
    <article class="coffee-card reveal visible" onclick="selectCoffee('${escapeHtml(c.name)}')">
      <div class="coffee-img" style="filter:hue-rotate(${i*12}deg)"></div>
      <div class="coffee-info"><span class="type">${escapeHtml(c.type)}</span><h3>${escapeHtml(c.name)}</h3>
      <div class="rating">★★★★★ <b>${Number(c.rating).toFixed(1)}</b> · ${c.reviews||0} reviews</div></div>
    </article>`).join("");
}
async function loadReviews(){
  const data=await getJSON(`${API}/reviews`,fallbackReviews);
  document.querySelector("#reviewList").innerHTML=data.slice(0,6).map(r=>`
    <article class="community-review reveal visible"><div class="review-head"><div class="user"><span class="user-avatar">${escapeHtml(r.name?.[0]||"U")}</span><strong>${escapeHtml(r.name||"Anonymous")}</strong></div><span class="review-date">${escapeHtml(r.date||"Recently")}</span></div>
    <div class="rating">${"★".repeat(Math.round(r.rating))}<span style="color:#554237">${"★".repeat(5-Math.round(r.rating))}</span> <b>${Number(r.rating).toFixed(1)}</b></div>
    <p class="review-text">“${escapeHtml(r.comment||"Great coffee!")}"</p></article>`).join("");
}
function setupStars(){
  const wrap=document.querySelector("#stars");
  wrap.innerHTML=[1,2,3,4,5].map(n=>`<span class="star ${n<=5?"active":""}" data-rating="${n}">★</span>`).join("");
  wrap.querySelectorAll(".star").forEach(s=>s.addEventListener("click",()=>{selectedRating=+s.dataset.rating; updateStars()}));
}
function updateStars(){
  document.querySelectorAll(".star").forEach(s=>s.classList.toggle("active",+s.dataset.rating<=selectedRating));
  document.querySelector("#ratingValue").textContent=selectedRating.toFixed(1);
}
function setupSliders(){
  ["taste","aroma","presentation"].forEach(id=>{
    const el=document.querySelector("#"+id), out=document.querySelector("#"+id+"Val");
    el.addEventListener("input",()=>out.textContent=el.value);
  });
}
document.querySelector("#reviewForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const payload={name:"You",coffeeName:document.querySelector("#coffeeName").value,type:document.querySelector("#coffeeType").value,rating:selectedRating,taste:+taste.value,aroma:+aroma.value,presentation:+presentation.value,comment:document.querySelector("#comment").value};
  try{await fetch(`${API}/reviews`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); showToast("Review published successfully ✦");}
  catch{showToast("Review saved in demo mode ✦");}
  e.target.reset(); selectedRating=5; updateStars(); ["taste","aroma","presentation"].forEach(id=>document.querySelector("#"+id+"Val").textContent=document.querySelector("#"+id).value);
  loadReviews();
});
function selectCoffee(name){document.querySelector("#coffeeName").value=name;document.querySelector("#review").scrollIntoView({behavior:"smooth"});showToast(`${name} selected ☕`)}
function showToast(text){const t=document.querySelector("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function animateCounts(){document.querySelectorAll("[data-count]").forEach(el=>{const target=+el.dataset.count;let start=0;const duration=1200,step=target/(duration/16);const tick=()=>{start=Math.min(target,start+step);el.textContent=target<10?start.toFixed(1):Math.floor(start);if(start<target)requestAnimationFrame(tick)};tick()})}
function observeReveal(){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});document.querySelectorAll(".reveal").forEach(x=>io.observe(x))}
function setupChart(){new Chart(document.querySelector("#ratingChart"),{type:"line",data:{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"],datasets:[{label:"Average rating",data:[4.2,4.4,4.3,4.6,4.5,4.7,4.6,4.8],borderWidth:2,tension:.45,fill:true,backgroundColor:"rgba(212,154,90,.08)",borderColor:"#d49a5a",pointBackgroundColor:"#d49a5a"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:"#8f7865"}},y:{min:3.5,max:5,grid:{color:"rgba(245,234,219,.07)"},ticks:{color:"#8f7865"}}}}})}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
