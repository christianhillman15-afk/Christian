(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
root.classList.remove('no-js');root.classList.add('js');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};const phase=(p,a,b)=>smooth((p-a)/(b-a));
const motionQuery=matchMedia('(prefers-reduced-motion:reduce)');let savedMotion=false;try{savedMotion=localStorage.getItem('ch-reduced-motion')==='true'}catch{}
let reduced=motionQuery.matches||savedMotion;
const story=$('.scroll-film'),stage=$('.film-stage'),scenes=$$('[data-scene]'),visual=$('.film-visual'),panels=$$('.visual-panel'),scrub=$('#film-scrub'),play=$('#play-film'),motion=$('#motion-toggle'),chapterButtons=$$('[data-chapter]'),pageProgress=$('.page-progress>i'),header=$('.header'),poster=$('.film-poster');
const marks=[0,.255,.445,.625,.80,.97];const labels=['Introduction','CTV','Google Ads','Web design','SEO','Your next chapter'];
const sceneWindows=[[0,0,.12,.20],[.17,.24,.31,.39],[.36,.43,.49,.57],[.54,.61,.67,.75],[.72,.79,.85,.93],[.90,.97,1,1]];
let metrics={top:0,travel:1,bottom:1,page:1,mobile:false};let lastP=-1,lastPx=0,lastPy=0,presence=0,lastDraw=0,ema=16.7,emaFrames=0,slowRun=0,glide=null,idleTimer=0,lastY=0,scrollDir=1;let frame=0,previousTime=0,current=0,px=0,py=0,tx=0,ty=0,playing=false,playStart=0,playOrigin=0,lastScroll=-1,activeScene=0,clock=0,visible=true,slowFrames=0;
function measure(){if(!window.SignalFilm)visual.classList.add('no-webgl');const y=scrollY;metrics={top:story.getBoundingClientRect().top+y,travel:Math.max(1,story.offsetHeight-stage.offsetHeight),bottom:story.getBoundingClientRect().bottom+y,page:Math.max(1,root.scrollHeight-innerHeight),mobile:innerWidth<=760};window.SignalFilm?.resize();request()}
function exposure(el,active){if(el.inert===!active)return;el.inert=!active;el.setAttribute('aria-hidden',String(!active));el.style.pointerEvents=active?'auto':'none'}
const exitEnd=w=>w[2]+(w[3]-w[2])*.6;
function windowOpacity(p,w,i){return(i===0?1:phase(p,w[0],w[1]))*(i===5?1:1-phase(p,w[2],exitEnd(w)))}
// DOM writes only when a value actually changes (text, attributes and custom properties re-trigger style and layout otherwise)
const put=(el,key,value)=>{if(el['_'+key]!==value){el['_'+key]=value;if(key[0]==='-')el.style.setProperty(key,value);else if(key==='aria-valuetext')el.setAttribute(key,value);else el[key]=value}};
const idxEl=$('#visual-index'),markEl=$('.film-chapter-mark>span:last-child'),ctvEl=$('.ctv-demo'),cdEl=$('.ctv-countdown b'),badgeEl=$('.tv-ad-badge b'),webEl=$('.concept-website'),qEl=$('.ads-query'),adsEl=$('.ads-panel'),seoEl=$('.seo-panel');
const markWords=['MAKE<br>YOUR MARK.','CONNECTED<br>TV','GOOGLE<br>ADS','WEB<br>DESIGN','SEARCH<br>& SEO','YOUR NEXT<br>CHAPTER'];
const bell=x=>{x=Math.max(0,1-Math.abs(x)/.085);return x*x*(3-2*x)};
function render(p){
 let dominant=0,strongest=-1;
 scenes.forEach((scene,i)=>{const w=sceneWindows[i],entry=i===0?1:phase(p,w[0],w[1]),exit=i===5?0:phase(p,w[2],exitEnd(w)),opacity=windowOpacity(p,w,i);scene.style.opacity=String(opacity);scene.style.transform=`translate3d(${exit*-12}px,${(1-entry)*32-exit*27}px,0)`;exposure(scene,opacity>.52);if(opacity>strongest){strongest=opacity;dominant=i}});
 activeScene=dominant;put(idxEl,'textContent',String(dominant).padStart(2,'0'));put(markEl,'innerHTML',markWords[dominant]);
 chapterButtons.forEach(b=>{const active=Number(b.dataset.chapter)===dominant;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 const transitioning=Math.max(...[.175,.355,.535,.715,.895].map(t=>bell(p-t)));
 const panelPresence=Math.max(...[1,2,3,4].map(i=>windowOpacity(p,sceneWindows[i],i)));
 visual.style.opacity=String((1-panelPresence*.75)*(metrics.mobile?.95:1));
 visual.style.transform=`translate3d(${transitioning*-3+px*.4}%,${py*.5}%,0) scale(${1+transitioning*.08})`;
 if(!window.SignalFilm?.available){poster.style.transform=`rotate(${p*180+px*1.2}deg) scale(${1+transitioning*.1})`}
 panels.forEach((panel,i)=>{panel.style.setProperty('--photo-drift',`${(clamp((p-sceneWindows[i+1][0])/(sceneWindows[i+1][3]-sceneWindows[i+1][0]))-.5)*-8}%`);const w=sceneWindows[i+1],enter=phase(p,w[0]-.01,w[1]+.008),exit=phase(p,w[2]-.004,exitEnd(w)+.006),opacity=enter*(1-exit),rx=(1-enter)*17+exit*-10,ry=(1-enter)*-48+exit*45;panel.style.opacity=String(opacity);panel.style.transform=`translate3d(${(1-enter)*18+exit*-23}%,${(1-enter)*17-exit*12}%,${-(1-enter)*240-exit*240}px) rotateY(${ry+px*1.2}deg) rotateX(${rx-py}deg) rotateZ(${(1-enter)*-5+exit*4}deg) scale(${.82+enter*.18-exit*.12})`;});
 const clip=clamp((p-.17)/.22);put(ctvEl,'--clip-progress',clip.toFixed(4));const secs=String(Math.max(0,15-Math.floor(clip*15))).padStart(2,'0');put(cdEl,'textContent',secs);put(badgeEl,'textContent','0:'+secs);put(webEl,'--web-pan',`${(-clamp((p-.54)/.21)*6).toFixed(3)}%`);const query='roof repair near me';put(qEl,'textContent',query.slice(0,Math.round(clamp((p-.355)/.055)*query.length)));put(adsEl,'--result-reveal',phase(p,.397,.429).toFixed(4));put(seoEl,'--rank-reveal',phase(p,.735,.779).toFixed(4));
 if(document.activeElement!==scrub)scrub.value=String(Math.round(p*1000));put(scrub,'--position',`${(p*100).toFixed(2)}%`);put(scrub,'aria-valuetext',labels[dominant]);
 return panelPresence;
}
function stopFilm(){playing=false;play.classList.remove('playing');play.querySelector('span').textContent=current>.97?'Replay the story':'Play the story';}
function setPosition(p){const before=root.style.scrollBehavior;root.style.scrollBehavior='auto';scrollTo({top:metrics.top+clamp(p)*metrics.travel,behavior:'instant'});root.style.scrollBehavior=before;request()}
function tick(time){
 frame=0;if(document.hidden){previousTime=0;return}
 const dt=previousTime?Math.min(65,time-previousTime):16.67;previousTime=time;
 if(playing){const next=clamp(playOrigin+(time-playStart)/26000);setPosition(next);if(next>=1)stopFilm()}
 if(glide){const k=clamp((time-glide.t0)/glide.dur),e=1-Math.pow(1-k,3);const b=root.style.scrollBehavior;root.style.scrollBehavior='auto';scrollTo({top:glide.from+glide.d*e,behavior:'instant'});root.style.scrollBehavior=b;if(k>=1)glide=null}
 const y=scrollY,target=clamp((y-metrics.top)/metrics.travel);header.classList.toggle('scrolled',y>20);pageProgress.style.transform=`scaleX(${clamp(y/metrics.page)})`;
 if(reduced){previousTime=0;return}
 const damping=1-Math.exp(-dt/115);current+=(target-current)*damping;px+=(tx-px)*damping;py+=(ty-py)*damping;
 if(Math.abs(target-current)<.00008)current=target;if(Math.abs(tx-px)<.004)px=tx;if(Math.abs(ty-py)<.004)py=ty;
 if(visible&&y<metrics.bottom&&y+innerHeight>metrics.top){
  clock+=dt*.001;
  if(current!==lastP||px!==lastPx||py!==lastPy){presence=render(current);lastP=current;lastPx=px;lastPy=py}
  const film=window.SignalFilm;
  if(film?.available){
   const settled=current===target&&px===tx&&py===ty,gap=settled?(presence>.9?66:15):0;
   if(time-lastDraw>=gap){lastDraw=time;film.draw(current,clock,px,py)}
   if(!playing){ema=ema*.95+dt*.05;if(++emaFrames>60){if(ema>22){if(++slowRun>40){slowRun=0;ema=16.7;if(!film.lowerQuality())film.disable()}}else slowRun=0}}
  }
 }
 lastScroll=y;
 if(playing||glide||(visible&&window.SignalFilm?.available)||current!==target||px!==tx||py!==ty)request();else previousTime=0;
}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}
function applyMotion(){stopFilm();root.classList.toggle('reduced-motion',reduced);motion.setAttribute('aria-pressed',String(reduced));motion.disabled=motionQuery.matches;motion.title=motionQuery.matches?'Set by your device':'';if(reduced){exposure(scenes[0],true);scenes.slice(1).forEach(s=>exposure(s,false))}else{current=clamp((scrollY-metrics.top)/metrics.travel);render(current)}measure()}
play.addEventListener('click',()=>{if(reduced)return;if(playing){stopFilm();return}if(current>.96){setPosition(0);current=0}playing=true;playOrigin=clamp((scrollY-metrics.top)/metrics.travel);playStart=performance.now();play.classList.add('playing');play.querySelector('span').textContent='Pause the story';request()});
['wheel','touchstart'].forEach(event=>window.addEventListener(event,()=>{if(playing)stopFilm()},{passive:true}));
window.addEventListener('keydown',e=>{if(playing&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Escape'].includes(e.key))stopFilm()});
scrub.addEventListener('input',()=>{stopFilm();setPosition(Number(scrub.value)/1000)});
scrub.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowUp:1,PageUp:1,ArrowLeft:-1,ArrowDown:-1,PageDown:-1}[e.key];if(!d)return;e.preventDefault();stopFilm();const p=clamp((scrollY-metrics.top)/metrics.travel);const next=d>0?(marks.find(m=>m>p+.01)??1):([...marks].reverse().find(m=>m<p-.01)??0);scrub.value=String(Math.round(next*1000));setPosition(next)});
chapterButtons.forEach(button=>button.addEventListener('click',()=>{stopFilm();glide=null;setPosition(marks[Number(button.dataset.chapter)]);setTimeout(()=>clearTimeout(idleTimer),0)}));
motion.addEventListener('click',()=>{if(motionQuery.matches)return;const inStory=scrollY<metrics.bottom;savedMotion=!savedMotion;reduced=savedMotion;try{localStorage.setItem('ch-reduced-motion',String(savedMotion))}catch{}applyMotion();if(inStory)scrollTo({top:0,behavior:'instant'})});
motionQuery.addEventListener('change',()=>{reduced=motionQuery.matches||savedMotion;applyMotion()});
const handoffs=[[.12,.24,0,1],[.31,.43,1,2],[.49,.61,2,3],[.67,.79,3,4],[.85,.97,4,5]];
function settleToChapter(){if(glide||playing||reduced||!visible)return;const p=clamp((scrollY-metrics.top)/metrics.travel);const z=handoffs.find(h=>p>h[0]&&p<h[1]);if(!z)return;const to=metrics.top+marks[scrollDir>0?z[3]:z[2]]*metrics.travel,d=to-scrollY;if(Math.abs(d)<3)return;glide={from:scrollY,d,t0:performance.now(),dur:Math.min(900,420+Math.abs(d)*.6)};request()}
window.addEventListener('scroll',()=>{request();const y=scrollY;if(y!==lastY&&!glide)scrollDir=y>lastY?1:-1;lastY=y;if(glide||playing)return;clearTimeout(idleTimer);idleTimer=setTimeout(settleToChapter,240)},{passive:true});
['wheel','touchstart','keydown','pointerdown'].forEach(ev=>window.addEventListener(ev,()=>{glide=null;clearTimeout(idleTimer)},{passive:true}));window.addEventListener('resize',measure,{passive:true});
if('ResizeObserver'in window)new ResizeObserver(measure).observe(document.body);if(document.fonts)document.fonts.ready.then(measure);
if('IntersectionObserver'in window){const storyObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else stopFilm()});storyObserver.observe(story);const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});$$('.reveal').forEach(el=>observer.observe(el))}else $$('.reveal').forEach(el=>el.classList.add('visible'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopFilm();cancelAnimationFrame(frame);frame=0;previousTime=0}else measure()});
if(matchMedia('(pointer:fine)').matches){$$('.service-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced)return;const r=card.getBoundingClientRect();card.style.setProperty('--spot-x',`${e.clientX-r.left}px`);card.style.setProperty('--spot-y',`${e.clientY-r.top}px`)},{passive:true})});stage.addEventListener('pointermove',e=>{if(reduced)return;tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*1.5;request()},{passive:true});stage.addEventListener('pointerleave',()=>{tx=ty=0;request()});$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced)return;const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${((e.clientX-r.left)/r.width-.5)*6}px`);el.style.setProperty('--my',`${((e.clientY-r.top)/r.height-.5)*5}px`)},{passive:true});el.addEventListener('pointerleave',()=>{el.style.setProperty('--mx','0px');el.style.setProperty('--my','0px')})})}
const nav=$('#navigation'),menu=$('.menu-toggle');function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)nav.querySelector('a').focus()});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{stopFilm();closeMenu()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
$$('.interest-link').forEach(link=>link.addEventListener('click',()=>{const input=$$('.interest-options input').find(i=>i.value===link.dataset.interest);if(input)input.checked=true}));
let copyTimer=0;$('.copy-email').addEventListener('click',async()=>{const st=$('.copy-status');clearTimeout(copyTimer);st.classList.remove('on');try{await navigator.clipboard.writeText('contact@christianrhillman.com');st.textContent='✳ Copied: contact@christianrhillman.com'}catch{st.textContent='contact@christianrhillman.com'}void st.offsetWidth;st.classList.add('on');copyTimer=setTimeout(()=>{st.textContent='';st.classList.remove('on')},3200)});
const form=$('#contact-form'),submit=$('#submit-button'),status=$('#form-status');
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity()||submit.disabled||form.elements.botcheck.checked)return;submit.disabled=true;submit.textContent='Sending…';status.textContent='';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const res=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:controller.signal});const data=await res.json();if(!res.ok||!data.success)throw Error('Unable to send');try{const f=Object.fromEntries(new FormData(form));fetch('/api/telegram-notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name,email:f.email,company:f.company,interest:f.interest,message:f.message}),keepalive:true}).catch(()=>{})}catch{}status.textContent='Thanks for reaching out. Your message is sent — I’ll be in touch.';form.reset()}catch{status.textContent='Your message couldn’t be sent. Please try again or use the email link. Your message is still here.'}finally{clearTimeout(timeout);submit.disabled=false;submit.textContent='Let’s start something';measure()}});
$('#year').textContent=new Date().getFullYear();measure();applyMotion();
})();
