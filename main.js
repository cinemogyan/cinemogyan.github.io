// main.js — SPA + Preload for www.mwsguy.com

// Partial SPA + preload
(function(){
  const pagesToPreload = [
    "/", "/?m=1",
    "/p/you-unlocked-video-streaming-tool.html",
    "/p/you-unlocked-video-streaming-tool.html?m=1",
    "/p/how-to-use-mwsguy-video-streaming-tool.html",
    "/p/how-to-use-mwsguy-video-streaming-tool.html?m=1",
    "/p/collection-hub.html",
    "/p/collection-hub.html?m=1",
    "/p/all-tool-and-pages.html",
    "/p/all-tool-and-pages.html?m=1"
  ];
  const MAIN_CONTENT_ID = 'main-content';
  const cache = {};

  function normalizeUrl(url){ try{ const u=new URL(url,location.origin); return u.pathname+u.search+u.hash;}catch(e){return url;} }
  function currentPath(){ return normalizeUrl(location.href);}
  function extractMainContent(html){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(html,'text/html'); const main=doc.getElementById(MAIN_CONTENT_ID); if(!main) return null; return {innerHTML:main.innerHTML,title:doc.title}; }catch(e){return null;} }
  function replaceMainContent(htmlObj){ const c=document.getElementById(MAIN_CONTENT_ID); if(!c) return false; c.innerHTML=htmlObj.innerHTML; if(htmlObj.title) document.title=htmlObj.title; window.scrollTo(0,0); return true; }
  function navigateTo(path,push=true){ const key=normalizeUrl(path); if(cache[key]){ replaceMainContent(cache[key]); if(push) history.pushState({url:key},'',key);} else{ window.location.href=path; } }
  document.addEventListener('click',function(e){ const a=e.target.closest('a'); if(!a) return; if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0) return; const href=a.getAttribute('href'); if(!href) return; const url=new URL(href,location.href); if(url.origin!==location.origin) return; const norm=normalizeUrl(url.href); if(pagesToPreload.map(normalizeUrl).includes(norm)){ e.preventDefault(); navigateTo(norm,true); }});
  function preloadSingle(url){ const key=normalizeUrl(url); if(cache[key]) return; fetch(url,{credentials:'same-origin'}).then(r=>r.text()).then(html=>{ const main=extractMainContent(html); if(main) cache[key]=main;}).catch(()=>{}); }
  function preloadAll(){ pagesToPreload.map(preloadSingle); }
  window.addEventListener('popstate',function(e){ const url=(e.state&&e.state.url)?e.state.url:currentPath(); if(cache[url]) replaceMainContent(cache[url]); else window.location.href=url; });
  document.addEventListener('DOMContentLoaded',preloadAll);
})();
