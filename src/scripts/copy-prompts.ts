export function initCopyPrompts(){
 document.querySelectorAll<HTMLButtonElement>('[data-copy-prompt]').forEach(button=>{
  if(button.dataset.wired)return;button.dataset.wired='true';
  button.addEventListener('click',async()=>{
   const target=document.getElementById(button.dataset.copyPrompt??'');
   const status=button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
   if(!target)return;
   try{await navigator.clipboard.writeText(target instanceof HTMLTextAreaElement?target.value:target.textContent??'');if(status)status.textContent='Copied. Replace the placeholders before using it.';}
   catch{if(status)status.textContent='Copy is unavailable. Select the prompt text and copy it manually.';if(target instanceof HTMLTextAreaElement)target.select();else{const range=document.createRange();range.selectNodeContents(target);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);}}
  });
 });
}
