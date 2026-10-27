/* Vascardio · Rutas de captación · comportamiento compartido (maqueta, sin envío real) */
(function(){
  var q; try{ q=new URLSearchParams(location.search); }catch(e){ q={get:function(){return null;}}; }
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var live=document.createElement('div'); live.className='vh'; live.setAttribute('aria-live','polite'); document.body.appendChild(live);
  function say(t){ live.textContent=''; setTimeout(function(){ live.textContent=t; },60); }
  var toast=document.createElement('div'); toast.className='toast'; toast.setAttribute('aria-hidden','true'); document.body.appendChild(toast);
  function pop(t){ toast.textContent=t; toast.classList.add('show'); clearTimeout(pop.t); pop.t=setTimeout(function(){ toast.classList.remove('show'); },1800); }

  /* ---------- teléfono: formato (305) 555-0142 ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function(i){
    i.addEventListener('input',function(){
      var d=i.value.replace(/\D/g,'').replace(/^1(?=\d{10})/,'').slice(0,10), o=d;
      if(d.length>6) o='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);
      else if(d.length>3) o='('+d.slice(0,3)+') '+d.slice(3);
      else if(d.length>0) o='('+d;
      i.value=o;
    });
  });

  /* ---------- validación ---------- */
  function fieldOf(el){ return el.closest('.field'); }
  function check(el){
    var f=fieldOf(el); if(!f) return true;
    var ok=true, v=(el.value||'').trim();
    if(el.type==='checkbox'){ ok=!el.required || el.checked; }
    else if(el.type==='radio'){ var g=f.querySelectorAll('input[name="'+el.name+'"]'); ok=[].some.call(g,function(r){return r.checked;}); }
    else if(el.required && !v){ ok=false; }
    else if(v && el.type==='tel'){ ok=v.replace(/\D/g,'').length===10; }
    else if(v && el.type==='email'){ ok=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
    f.classList.toggle('invalid',!ok);
    el.setAttribute('aria-invalid',String(!ok));
    return ok;
  }
  function validate(step){
    var bad=[], seen={};
    step.querySelectorAll('input,select,textarea').forEach(function(el){
      if(el.closest('[hidden]')) return;
      var need=el.required || (el.type==='radio' && el.closest('[data-required]')) || ((el.type==='tel'||el.type==='email') && el.value);
      if(!need) return;
      if(el.type==='radio'){ if(seen[el.name]) return; seen[el.name]=1; }
      if(!check(el)){ var f=fieldOf(el); bad.push({el:el,msg:(f.querySelector('.err')||{}).textContent||'Revise este campo'}); }
    });
    var sum=step.querySelector('[data-errsum]');
    if(sum){
      if(bad.length){
        sum.hidden=false;
        sum.innerHTML='<h3 tabindex="-1">'+(bad.length===1?'Falta un dato':'Faltan '+bad.length+' datos')+'</h3><ul>'+bad.map(function(b){
          var id=b.el.id||(b.el.id='f'+Math.random().toString(36).slice(2,7));
          return '<li><a href="#'+id+'">'+b.msg.trim()+'</a></li>';}).join('')+'</ul>';
        sum.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); var t=document.getElementById(a.getAttribute('href').slice(1)); t.focus(); t.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'}); }); });
        sum.querySelector('h3').focus();
      } else { sum.hidden=true; sum.innerHTML=''; }
    } else if(bad.length){ bad[0].el.focus(); }
    return !bad.length;
  }
  document.addEventListener('change',function(e){ var el=e.target; if(el.closest && fieldOf(el) && fieldOf(el).classList.contains('invalid')) check(el); });
  document.addEventListener('input',function(e){ var el=e.target; if(el.closest && fieldOf(el) && fieldOf(el).classList.contains('invalid')) check(el); });

  /* ---------- mostrar según elección ---------- */
  function syncShow(scope){
    (scope||document).querySelectorAll('[data-show-if]').forEach(function(el){
      var p=el.getAttribute('data-show-if').split('='), r=document.querySelector('input[name="'+p[0]+'"]:checked');
      var vals=p[1].split('|'); el.hidden=!(r && vals.indexOf(r.value)>-1);
    });
    document.querySelectorAll('[data-label-of]').forEach(function(el){
      var r=document.querySelector('input[name="'+el.getAttribute('data-label-of')+'"]:checked');
      if(r){ var l=r.closest('label'); var b=l && (l.querySelector('b')||l); el.textContent=(b.textContent||'').trim(); }
    });
  }
  document.addEventListener('change',function(e){ if(e.target.type==='radio') syncShow(); });

  /* ---------- flujos por pasos ---------- */
  document.querySelectorAll('[data-flow]').forEach(function(flow){
    var steps=[].slice.call(flow.querySelectorAll('[data-step]'));
    var prog=document.querySelectorAll('.prog[data-for="'+flow.id+'"] li');
    var order=steps.map(function(s){return s.getAttribute('data-step');});
    function show(id,focus){
      var idx=order.indexOf(id); if(idx<0){ idx=0; id=order[0]; }
      steps.forEach(function(s){ s.hidden=s.getAttribute('data-step')!==id; });
      prog.forEach(function(li){
        var k=order.indexOf(li.getAttribute('data-k'));
        li.classList.toggle('done',k<idx || id==='listo');
        if(k===idx && id!=='listo') li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
      });
      document.body.setAttribute('data-paso',id);
      flow.setAttribute('data-at',id);
      syncShow();
      if(id==='listo') fillOut(flow);
      if(focus){
        var h=flow.querySelector('[data-step="'+id+'"] [data-focus]')||flow.querySelector('[data-step="'+id+'"] h1, [data-step="'+id+'"] h2');
        if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
        var top=flow.getAttribute('data-scroll')==='panel' ? null : 0;
        if(top!==null) window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
        else if(window.matchMedia('(max-width: 980px)').matches) flow.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
        var t=flow.querySelector('[data-step="'+id+'"]').getAttribute('data-say'); if(t) say(t);
      }
      try{ var u=new URL(location.href); u.searchParams.set('paso',id); u.searchParams.delete('err'); history.replaceState(null,'',u); }catch(e){}
    }
    flow.addEventListener('click',function(e){
      var b=e.target.closest('[data-next],[data-back],[data-goto]'); if(!b) return;
      e.preventDefault();
      var cur=flow.getAttribute('data-at'), i=order.indexOf(cur);
      if(b.hasAttribute('data-goto')) return show(b.getAttribute('data-goto'),true);
      if(b.hasAttribute('data-back')) return show(order[Math.max(0,i-1)],true);
      var step=flow.querySelector('[data-step="'+cur+'"]');
      if(!validate(step)) return;
      if(b.hasAttribute('data-sending')){
        b.disabled=true; var txt=b.innerHTML; b.innerHTML='<span class="spin" aria-hidden="true"></span> Enviando…';
        setTimeout(function(){ b.disabled=false; b.innerHTML=txt; show(order[i+1],true); }, reduce?0:700);
      } else show(order[i+1],true);
    });
    flow.addEventListener('submit',function(e){ e.preventDefault(); var b=flow.querySelector('[data-step="'+flow.getAttribute('data-at')+'"] [data-next]'); if(b) b.click(); });
    var start=q.get('paso'); show(start && order.indexOf(start)>-1 ? start : order[0], false);
    if(q.get('err')){ var s=flow.querySelector('[data-step="'+flow.getAttribute('data-at')+'"]'); validate(s); window.scrollTo(0,0); }
  });

  function fillOut(flow){
    flow.querySelectorAll('[data-out]').forEach(function(o){
      var src=flow.querySelector('[name="'+o.getAttribute('data-out')+'"]');
      if(src && src.value && src.value.trim()) o.textContent=src.value.trim();
    });
  }

  /* ---------- horario hábil (Hialeah, hora del este) ---------- */
  document.querySelectorAll('[data-hours]').forEach(function(el){
    var open=false;
    try{
      var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());
      var wd=p.find(function(x){return x.type==='weekday';}).value, h=+p.find(function(x){return x.type==='hour';}).value;
      open=['Mon','Tue','Wed','Thu','Fri'].indexOf(wd)>-1 && h>=8 && h<17;
    }catch(e){}
    var f=q.get('horario'); if(f==='fuera') open=false; if(f==='dentro') open=true;
    el.textContent=el.getAttribute(open?'data-in':'data-out');
  });

  /* ---------- copiar (fax) ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var v=b.getAttribute('data-copy'), lbl=b.querySelector('span');
      function done(){ b.classList.add('ok'); if(lbl) lbl.textContent='Copiado'; say('Número de fax copiado'); pop('Fax copiado: '+v); setTimeout(function(){ b.classList.remove('ok'); if(lbl) lbl.textContent='Copiar'; },2200); }
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done,done); else done();
    });
  });

  /* ---------- lista de adjuntos ---------- */
  document.querySelectorAll('[data-checklist]').forEach(function(list){
    var m=document.querySelector('[data-meter="'+list.id+'"]');
    function up(){ var a=list.querySelectorAll('input'), n=[].filter.call(a,function(i){return i.checked;}).length;
      if(m){ m.querySelector('i').style.setProperty('--v',a.length?n/a.length:0); m.querySelector('span').textContent=n+' de '+a.length+' listos'; } }
    list.addEventListener('change',up); up();
  });

  /* ---------- enlaces de maqueta ---------- */
  document.querySelectorAll('a[href="#"]').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); pop('Enlace de maqueta'); }); });
  document.querySelectorAll('[data-demo]').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); pop(a.getAttribute('data-demo')); }); });

  syncShow();
})();
