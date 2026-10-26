'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let cart=store.get('bc_cart',[]),wish=store.get('bc_wish',[]);
const money=n=>'$'+n;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}
addEventListener('load',()=>setTimeout(()=>$('#loader').classList.add('done'),reduce?0:600));
// scroll: progress bar, header hide/show, hero parallax
let lastY=0;const nav=$('#nav'),bar=$('#progress'),hi=$('.hero-i img');
addEventListener('scroll',()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
 bar.style.transform=`scaleX(${h>0?y/h:0})`;nav.classList.toggle('stuck',y>20);nav.classList.toggle('hide',y>lastY&&y>400&&!$('#menu').classList.contains('open'));lastY=y;
 if(hi&&!reduce&&y<900)hi.style.translate=`0 ${y*.08}px`},{passive:true});
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
$$('#menu a').forEach(a=>a.addEventListener('click',()=>$('#menu').classList.remove('open')));
// scroll reveal + electric flash on glowing cards
const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;const el=x.target;el.classList.add('in');
 if(el.classList.contains('glow')&&!reduce){setTimeout(()=>{el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)},500)}io.unobserve(el)}),{threshold:.18});
$$('.reveal').forEach(el=>{const sib=[...el.parentElement.children].indexOf(el);el.style.transitionDelay=Math.min(sib,4)*90+'ms';io.observe(el)});
// spotlight follows the cursor, cards tilt
if(fine){document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.spot');if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
 if(c.classList.contains('tilt')&&!reduce){c.style.setProperty('--ry',((x/r.width-.5)*7).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y/r.height)*7).toFixed(2)+'deg')}});
 document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.tilt');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
 // magnetic buttons
 $$('.mag').forEach(b=>{if(reduce)return;b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.18}px ${(e.clientY-r.top-r.height/2)*.25}px`});b.addEventListener('pointerleave',()=>b.style.translate='')})}
// clicks: ripple, add to cart, wishlist, faq
document.addEventListener('click',e=>{
 const b=e.target.closest('.btn');
 if(b&&!reduce){const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement('span');s.className='ripple';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),600)}
 const a=e.target.closest('[data-add]');if(a)add(a.dataset);
 const w=e.target.closest('[data-w]');if(w){const id=w.dataset.w;wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];store.set('bc_wish',wish);syncWish();toast(wish.includes(id)?'Saved to wishlist':'Removed from wishlist')}
 const q=e.target.closest('.fq button');if(q){const f=q.parentElement,o=!f.classList.contains('open');$$('.fq',f.parentElement).forEach(x=>{x.classList.remove('open');$('button',x).setAttribute('aria-expanded','false')});if(o){f.classList.add('open');q.setAttribute('aria-expanded','true')}}
});
function syncWish(){$$('[data-w]').forEach(w=>{const on=wish.includes(w.dataset.w);w.classList.toggle('on',on);w.textContent=on?'♥':'♡'})}
// cart
function add(d){const i=cart.find(x=>x.id===d.id);i?i.q++:cart.push({id:d.id,name:d.name,price:+d.price,q:1});saveCart();toast(d.name+' added to cart');const c=$('#cartCount');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}
function saveCart(){store.set('bc_cart',cart);drawCart()}
function drawCart(){$('#cartCount').textContent=cart.reduce((n,x)=>n+x.q,0);
 $('#cartList').innerHTML=cart.length?cart.map(x=>`<li><div><b>${x.name}</b><br><small>${money(x.price)} each</small></div><b>${money(x.price*x.q)}</b><div class="qty"><button data-q="${x.id}" data-d="-1" aria-label="Decrease">−</button><span>${x.q}</span><button data-q="${x.id}" data-d="1" aria-label="Increase">+</button></div><button class="rm" data-r="${x.id}">Remove</button></li>`).join(''):'<li class="ce">Your cart is empty. Add some flowers to get started.</li>';
 $('#total').textContent=money(cart.reduce((n,x)=>n+x.price*x.q,0))}
$('#cartList').onclick=e=>{const q=e.target.closest('[data-q]'),r=e.target.closest('[data-r]');
 if(q){const i=cart.find(x=>x.id===q.dataset.q);i.q+=+q.dataset.d;if(i.q<1)cart=cart.filter(x=>x!==i)}if(r)cart=cart.filter(x=>x.id!==r.dataset.r);saveCart()};
const open=v=>{$('#drawer').classList.toggle('on',v);$('#scrim').classList.toggle('on',v)};
$('#cartBtn').onclick=()=>open(true);$('#closeCart').onclick=$('#scrim').onclick=()=>open(false);
addEventListener('keydown',e=>e.key==='Escape'&&open(false));
$('#checkout').onclick=()=>{if(!cart.length)return toast('Add something to your cart first');cart=[];saveCart();open(false);toast('Thank you! Your order is placed.')};
// blog filter
const chips=$('#chips');if(chips)chips.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;$$('.chip',chips).forEach(x=>x.classList.toggle('on',x===b));
 $$('#posts .card').forEach(c=>{const show=b.dataset.c==='All Stories'||c.dataset.cat===b.dataset.c;c.classList.toggle('off',!show);if(show){c.classList.add('in');c.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'})}})};
// forms
function check(f,n){let ok=true;$$('input,textarea',f).forEach(x=>{const bad=!x.value.trim()||(x.type==='email'&&!/^\S+@\S+\.\S+$/.test(x.value));x.classList.toggle('bad',bad);if(bad)ok=false});n.className='note'+(ok?'':' err');return ok}
const cf=$('#contactForm');if(cf)cf.onsubmit=e=>{e.preventDefault();const n=$('#formNote');if(check(cf,n)){n.textContent='Thank you! We will reply within one working day.';cf.reset()}else n.textContent='Please complete every field with a valid email address.'};
$$('.nf').forEach(f=>f.onsubmit=e=>{e.preventDefault();const n=f.nextElementSibling;if(check(f,n)){n.textContent='You are subscribed. Welcome to Bloom & Co.!';f.reset()}else n.textContent='Please enter a valid email address.'});
syncWish();drawCart();
