// ---------- nav active state + mobile menu ----------
const navLinks = document.querySelectorAll('.nav-links a');
const sections = [...document.querySelectorAll('section[id]')];
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', ()=>{
  const open = navLinksEl.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinksEl.classList.remove('open')));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(l=>l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
    }
  });
},{rootMargin:'-45% 0px -45% 0px'});
sections.forEach(s=>navObserver.observe(s));

// ---------- scroll reveal ----------
if(!reduceMotion){
  const revealObs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target);} });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}

// ---------- timeline active dot ----------
const tlObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.5});
document.querySelectorAll('.tl-item').forEach(el=>tlObs.observe(el));

// ---------- skills filter ----------
document.getElementById('skillTabs').addEventListener('click', e=>{
  const btn = e.target.closest('.skill-tab'); if(!btn) return;
  document.querySelectorAll('.skill-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.cat;
  document.querySelectorAll('#skillGrid .skill-card').forEach(c=>{
    c.classList.toggle('skill-hidden', cat!=='all' && c.dataset.cat!==cat);
  });
});

// ---------- lab cards ----------
document.getElementById('labGrid').addEventListener('click', e=>{
  const card = e.target.closest('.lab-card'); if(!card) return;
  card.classList.toggle('open');
});

// ---------- hero particle nodes ----------
(function(){
  const canvas = document.getElementById('nodeCanvas');
  const stage = document.getElementById('heroStage');
  const ctx = canvas.getContext('2d');
  let w,h,dpr=Math.min(window.devicePixelRatio||1,2);
  const labels = ['AI','DATA','CODE','SYSTEMS'];
  const colors = ['#FF5A3C','#3452FF','#FFB627','#0E9E8F'];
  let nodes = [];
  let mouse = {x:-999,y:-999};

  function resize(){
    w = stage.clientWidth; h = stage.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes = labels.map((l,i)=>({
      label:l, color:colors[i],
      x: w*(0.2+0.6*(i%2)) + (i>1? w*0.1:0), y: h*(0.22+0.28*(i>1?1:0)) + (i%2? h*0.14:0),
      baseX:0, baseY:0, vx:0, vy:0
    }));
    nodes.forEach(n=>{n.baseX=n.x;n.baseY=n.y;});
  }
  resize();
  window.addEventListener('resize', resize);
  stage.addEventListener('mousemove', e=>{
    const r = stage.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  stage.addEventListener('mouseleave', ()=>{ mouse.x=-999; mouse.y=-999; });

  function frame(){
    ctx.clearRect(0,0,w,h);
    // connecting lines
    ctx.strokeStyle = 'rgba(28,26,23,0.12)';
    ctx.lineWidth = 1.4;
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    nodes.forEach(n=>{
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const dist = Math.hypot(dx,dy);
      const force = reduceMotion ? 0 : Math.max(0, 1 - dist/220);
      const tx = n.baseX - dx*force*0.35;
      const ty = n.baseY - dy*force*0.35;
      n.vx += (tx - n.x)*0.08; n.vy += (ty - n.y)*0.08;
      n.vx*=0.82; n.vy*=0.82;
      n.x+=n.vx; n.y+=n.vy;

      ctx.beginPath();
      ctx.fillStyle = n.color;
      ctx.arc(n.x, n.y, 9, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = n.color;
      ctx.globalAlpha = 0.25;
      ctx.arc(n.x, n.y, 20, 0, Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.font = "600 13px 'Space Grotesk', sans-serif";
      ctx.fillStyle = '#1C1A17';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y - 18);
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

// ---------- command palette ----------
(function(){
  const commands = [
    {label:'Projects', href:'#projects'},
    {label:'Skills', href:'#skills'},
    {label:'GitHub — open profile', href:'https://github.com/joseph-stalin', ext:true},
    {label:'LinkedIn — open profile', href:'https://www.linkedin.com/in/joseph-stalin', ext:true},
    {label:'Contact', href:'#contact'},
    {label:'About', href:'#about'},
    {label:'Journey', href:'#journey'},
    {label:'Certificates', href:'#certificates'},
  ];
  const backdrop = document.getElementById('cmdkBackdrop');
  const input = document.getElementById('cmdkInput');
  const list = document.getElementById('cmdkList');
  let sel = 0, filtered = commands;

  function render(){
    list.innerHTML='';
    filtered.forEach((c,i)=>{
      const div = document.createElement('div');
      div.className = 'cmdk-item'+(i===sel?' sel':'');
      div.textContent = c.label;
      div.addEventListener('click', ()=>go(c));
      list.appendChild(div);
    });
  }
  function go(c){
    close();
    if(c.ext) window.open(c.href,'_blank','noopener');
    else document.querySelector(c.href)?.scrollIntoView({behavior: reduceMotion?'auto':'smooth'});
  }
  function open(){ backdrop.classList.add('open'); input.value=''; filtered=commands; sel=0; render(); setTimeout(()=>input.focus(),10); }
  function close(){ backdrop.classList.remove('open'); }

  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key==='/'){ e.preventDefault(); open(); }
    else if(e.key==='Escape') close();
  });
  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) close(); });
  input.addEventListener('input', ()=>{
    const q = input.value.toLowerCase();
    filtered = commands.filter(c=>c.label.toLowerCase().includes(q));
    sel=0; render();
  });
  input.addEventListener('keydown', e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(sel+1, filtered.length-1); render(); }
    if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(sel-1,0); render(); }
    if(e.key==='Enter'){ if(filtered[sel]) go(filtered[sel]); }
  });
})();
