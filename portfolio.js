const filterButtons=[...document.querySelectorAll('[data-filter]')];
const projects=[...document.querySelectorAll('[data-category]')];
filterButtons.forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.filter;
 filterButtons.forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});
 let visible=0;
 projects.forEach(project=>{project.hidden=category!=='all'&&project.dataset.category!==category;if(!project.hidden){visible++;project.classList.remove('is-pending-reveal');}});
 document.querySelector('.project-count').textContent=visible+' 个作品分类';
}));
const openLetter=document.querySelector('#open-letter'),letterArea=document.querySelector('#letter-area');
if(openLetter&&letterArea){
 function setLetter(open){letterArea.hidden=!open;openLetter.setAttribute('aria-expanded',String(open));if(open)document.querySelector('#name').focus({preventScroll:false});else openLetter.focus();}
 openLetter.addEventListener('click',()=>setLetter(letterArea.hidden));
 document.querySelector('#close-letter').addEventListener('click',()=>setLetter(false));
 if(location.hash==='#letter')setLetter(true);
}
const sections=[...document.querySelectorAll('main section[id]')];
const links=[...document.querySelectorAll('nav a')];
if('IntersectionObserver' in window){
 const navObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting)links.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 },{rootMargin:'-15% 0px -50% 0px'});
 sections.forEach(section=>navObserver.observe(section));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.documentElement.classList.add('motion-ready');
  const collage=document.querySelector('.collage');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('is-pending-reveal');if(entry.target===collage)entry.target.classList.add('is-settled');observer.unobserve(entry.target);}}),{threshold:.16});
  if(collage)observer.observe(collage);
  projects.forEach(project=>{project.classList.add('is-pending-reveal');observer.observe(project)});
 }
}
