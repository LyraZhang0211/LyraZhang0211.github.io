document.querySelectorAll('[data-copy]').forEach(button=>{
  button.addEventListener('click',async()=>{
    const value=button.dataset.copy||'';
    let copied=false;
    try{
      await navigator.clipboard.writeText(value);
      copied=true;
    }catch{
      const input=document.createElement('textarea');
      input.value=value;
      input.setAttribute('readonly','');
      input.style.position='fixed';
      input.style.opacity='0';
      document.body.appendChild(input);
      input.select();
      copied=document.execCommand('copy');
      input.remove();
    }
    if(!copied)return;
    button.textContent='已复制';
    button.classList.add('is-copied');
    window.setTimeout(()=>{
      button.textContent='点击复制';
      button.classList.remove('is-copied');
    },1500);
  });
});

document.querySelectorAll('[data-qr-switcher]').forEach(switcher=>{
  const tabs=[...switcher.querySelectorAll('[data-qr-tab]')];
  const panels=[...switcher.querySelectorAll('[data-qr-panel]')];
  const caption=switcher.querySelector('[data-qr-caption]');
  const labels={wechat:'微信二维码',rednote:'小红书二维码'};

  const activate=name=>{
    tabs.forEach(tab=>{
      const active=tab.dataset.qrTab===name;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
    panels.forEach(panel=>{
      const active=panel.dataset.qrPanel===name;
      panel.setAttribute('aria-hidden',String(!active));
      panel.classList.toggle('is-active',active);
    });
    if(caption)caption.textContent=labels[name]||'';
  };

  tabs.forEach((tab,index)=>{
    const select=()=>activate(tab.dataset.qrTab||'wechat');
    tab.addEventListener('mouseenter',select);
    tab.addEventListener('focus',select);
    tab.addEventListener('click',select);
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      let next=index;
      if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      tabs[next].focus();
    });
  });
});
