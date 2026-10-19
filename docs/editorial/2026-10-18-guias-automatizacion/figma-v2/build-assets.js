// Runs inside Figma MCP. Native text, auto-layout and vector illustration only.
// KIND, PAGE_ID, LANGUAGES are supplied by the orchestration call.
await Promise.all(['Regular','Medium','SemiBold','Bold'].map(style=>figma.loadFontAsync({family:'DM Sans',style})));
await figma.loadFontAsync({family:'JetBrains Mono',style:'Regular'});
const page=await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const created=[];
const palette={paper:'#FAF9FF',ink:'#171A2B',muted:'#595F75',blue:'#315BDA',violet:'#6944BF',rose:'#963D88',line:'#D8D9E8',white:'#FFFFFF',wash:'#EEEDF9',green:'#246B59'};
const styles=Object.fromEntries((await figma.getLocalPaintStylesAsync()).map(s=>[s.name.replace('AgentesVA / ',''),s.id]));
const track=n=>(created.push(n.id),n);
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
function paint(n,key){n.fills=[{type:'SOLID',color:rgb(palette[key])}];if(styles[key])n.fillStyleId=styles[key];}
function box(parent,w,dir='VERTICAL',color=null,pad=0,gap=16){
 const n=track(figma.createAutoLayout(dir));n.name='Editorial group';n.resize(w,100);
 n.layoutSizingHorizontal='FIXED';n.layoutSizingVertical='HUG';n.itemSpacing=gap;
 n.paddingLeft=n.paddingRight=n.paddingTop=n.paddingBottom=pad;n.fills=[];n.clipsContent=false;
 if(color)paint(n,color);if(parent)parent.appendChild(n);return n;
}
function text(parent,value,size=28,style='Regular',color='ink',w){
 const n=track(figma.createText());n.name=value.slice(0,72);n.fontName={family:'DM Sans',style};
 n.fontSize=size;n.lineHeight={unit:'PERCENT',value:122};n.characters=value;paint(n,color);
 const width=w??parent.width-parent.paddingLeft-parent.paddingRight;
 n.resize(width,size*1.3);n.textAutoResize='HEIGHT';parent.appendChild(n);return n;
}
function mono(parent,value,size=21,color='muted',w){const n=text(parent,value,size,'Regular',color,w);n.fontName={family:'JetBrains Mono',style:'Regular'};return n;}
function panel(parent,w,h,color='wash'){const n=track(figma.createFrame());n.name='Editable illustration';n.resize(w,h);paint(n,color);n.cornerRadius=20;n.clipsContent=false;if(parent)parent.appendChild(n);return n;}
function rect(parent,x,y,w,h,color,r=8){const n=track(figma.createRectangle());n.resize(w,h);n.x=x;n.y=y;n.cornerRadius=r;paint(n,color);parent.appendChild(n);return n;}
function dot(parent,x,y,size,color){const n=track(figma.createEllipse());n.resize(size,size);n.x=x;n.y=y;paint(n,color);parent.appendChild(n);return n;}
function edge(parent,w,h,path,color='blue',dash=false){const n=track(figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${path}" fill="none" stroke="${palette[color]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" ${dash?'stroke-dasharray="9 9"':''}/></svg>`));n.name='Routing / '+color;parent.appendChild(n);return n;}
function paper(parent,x,y,w,h,color,label){const n=box(parent,w,'VERTICAL','white',18,12);n.x=x;n.y=y;n.cornerRadius=12;mono(n,label,22,color);const d=panel(n,w-36,h-70,'paper');d.cornerRadius=4;for(let j=0;j<3;j++)rect(d,12,12+j*19,(w-60)*(j===2?.56:.8),5,j===0?color:'line',2);return n;}
function chips(parent,labels,color,w){const group=box(parent,w,'VERTICAL',null,0,7);for(const label of labels)text(group,label,25,'SemiBold',color);return group;}
function miniArt(parent,w,type,color){
 const canvas=panel(parent,w,154,'wash');
 if(type==='apps'){rect(canvas,18,25,w-36,108,'white',14);rect(canvas,33,43,38,38,color,10);for(let i=0;i<3;i++)rect(canvas,86,45+i*23,Math.max(12,w-125-(i===2?26:0)),7,i===0?color:'line',3);}
 if(type==='bridge'){const aw=Math.min(84,(w-54)/2);edge(canvas,w,154,`M ${w*.27} 77 H ${w*.73}`,color);rect(canvas,15,39,aw,80,'white',14);rect(canvas,w-15-aw,39,aw,80,'white',14);dot(canvas,15+aw/2-14,61,28,color);dot(canvas,w-15-aw/2-14,61,28,color);dot(canvas,w/2-5,72,10,color);}
 if(type==='network'){edge(canvas,w,154,`M ${w*.5} 76 L ${w*.19} 32 M ${w*.5} 76 L ${w*.81} 32 M ${w*.5} 76 L ${w*.19} 123 M ${w*.5} 76 L ${w*.81} 123`,color);for(const [x,y]of[[.19,32],[.81,32],[.19,123],[.81,123]])dot(canvas,w*x-14,y-14,28,'white');dot(canvas,w/2-28,48,56,color);}
 if(type==='files'){for(let j=0;j<4;j++){const x=12+j*(w-24)/4;rect(canvas,x,28,(w-42)/4,100,'white',8);rect(canvas,x+10,42,(w-82)/4,6,color,2);for(let k=0;k<3;k++)rect(canvas,x+10,66+k*16,(w-90)/4,4,'line',2);}}
 if(type==='method'){for(let j=0;j<3;j++)rect(canvas,24+j*13,25+j*28,w-84,56,j===2?color:'white',10);}
 if(type==='calendar'){for(let r=0;r<3;r++)for(let c=0;c<5;c++)rect(canvas,18+c*(w-36)/5,20+r*40,(w-56)/5,30,(r+c)%4===0?color:'white',6);}
 if(type==='people'){const ds=Math.min(50,w*.24);edge(canvas,w,154,`M ${w*.2} 76 H ${w*.8}`,color);for(let j=0;j<3;j++){dot(canvas,w*(.2+.3*j)-ds/2,76-ds/2,ds,j===1?color:'white');dot(canvas,w*(.2+.3*j)-6,70,12,j===1?'white':color);}}
 return canvas;
}
function note(root,content){const n=box(root,root.width-root.paddingLeft-root.paddingRight,'VERTICAL',null,0,0);text(n,content,22,'Regular','muted');return n;}
function rootFrame(kind,asset,lang,mobile,title,sub){
 const width=mobile?600:1200,pad=mobile?32:48;
 const name=`${kind}-${asset}-${lang}${mobile?'-mobile':''}`;
 if(page.children.some(n=>n.name===name))throw new Error('Already exists: '+name);
 const f=box(null,width,'VERTICAL','paper',pad,mobile?28:30);f.name=name;f.cornerRadius=24;
 f.x=200+(['atlas','case','infographic'].indexOf(asset))*1460;f.y=200+(lang==='en'?3000:0)+(mobile?1200:0);
 f.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:1}},{format:'SVG',svgOutlineText:true}];
 const head=box(f,width-pad*2,'VERTICAL',null,0,12);
 mono(head,`AGENTESVA / ${kind==='processes'?'01 · WORKFLOWS':kind==='claude'?'02 · CLAUDE':'03 · SOCIAL'}`,20,'blue');
 text(head,title,mobile?44:58,'Bold','ink');if(sub)text(head,sub,mobile?27:29,'Regular','muted');return f;
}
function atlas(lang,mobile){
 const es=lang==='es',kind=KIND;
 const title=kind==='processes'?(es?'Empieza donde vive el trabajo.':'Start where the work lives.'):kind==='claude'?(es?'Añade la capacidad que falta.':'Add the capability you need.'):es?'Resuelve tu cuello de botella.':'Fix your publishing bottleneck.';
 const sub=es?'Una decisión por necesidad. No es un ranking.':'A choice for each job. Not a performance ranking.';
 const f=rootFrame(kind,'atlas',lang,mobile,title,sub),inner=f.width-f.paddingLeft*2,gap=20;
 const groups=kind==='processes'?[
  [es?'Una aplicación':'One application',['Airtable','Power Automate'],es?'Prueba primero la función nativa.':'Try the built-in feature first.','apps','blue'],
  [es?'Varias aplicaciones':'Several applications',['Make','Zapier'],es?'Conecta entradas, reglas y salidas.':'Connect inputs, rules and outputs.','bridge','violet'],
  [es?'Control técnico':'Technical ownership',['n8n · Activepieces','Apps Script'],es?'Asigna quién mantiene el flujo.':'Name the person who maintains it.','network','rose']
 ]:kind==='claude'?[
  [es?'Archivos de trabajo':'Work files',['xlsx · docx','pptx · pdf'],es?'Revisa primero la capacidad incluida.':'Check the included capability first.','files','blue'],
  [es?'Tu forma de trabajar':'Your way of working',['skill-creator · frontend-design','Marketing Skills · Superpowers'],es?'Elige el método por la tarea.':'Choose a method for the task.','method','violet'],
  [es?'Conexiones preparadas':'Ready-made connections',['Creator Skill Pack','Founder Ops Skill Pack'],es?'Packs de pago; cuentas y uso aparte.':'Paid packs; accounts and usage extra.','network','rose']
 ]:[
  [es?'Una cola pequeña':'A small publishing queue',['Meta Business Suite','Buffer · Publer'],es?'Meta: Facebook e Instagram.':'Meta: Facebook and Instagram.','calendar','blue'],
  [es?'Ritmo editorial':'Editorial rhythm',['Metricool · Later','SocialBee'],es?'Informes, contenido visual o reutilización.':'Reporting, visual planning or reuse.','method','violet'],
  [es?'Coordinar personas':'Coordinate people',['Hootsuite'],es?'Comprueba permisos, plan y asientos.':'Check permissions, plan and seats.','people','rose']
 ];
 const body=box(f,inner,mobile?'VERTICAL':'HORIZONTAL',null,0,gap),cw=mobile?inner:(inner-gap*2)/3;
 for(const [title,names,detail,art,color]of groups){
  const card=box(body,cw,'VERTICAL','white',mobile?22:20,18);card.cornerRadius=18;
  if(mobile){const row=box(card,cw-44,'HORIZONTAL',null,0,20);const artW=142;miniArt(row,artW,art,color);const labels=box(row,cw-44-artW-20,'VERTICAL',null,0,12);text(labels,title,30,'Bold');chips(labels,names,color,labels.width);text(card,detail,26,'Regular','muted');}
  else{miniArt(card,cw-40,art,color);text(card,title,32,'Bold');chips(card,names,color,cw-40);text(card,detail,25,'Regular','muted');}
 }
 note(f,kind==='claude'?(es?'Disponibilidad, licencia y consumo dependen del entorno. Ver condiciones y fuentes en la guía.':'Availability, licensing and usage depend on the environment. Conditions and sources are in the guide.'):(es?'Selección editorial por encaje. Consulta límites, precios y pruebas en la guía.':'Editorial selection by fit. Check limits, prices and trial criteria in the guide.'));return f;
}
function processCase(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'case',lang,mobile,es?'Un registro. Dos rutas.':'One record. Two routes.',es?'El flujo también necesita saber cuándo parar.':'The workflow needs to know when to stop.');
 const w=f.width-f.paddingLeft*2;
 if(mobile){
  const input=box(f,w,'VERTICAL','white',24,12);input.cornerRadius=16;mono(input,es?'ENTRADA / #1042':'INPUT / #1042',22,'blue');text(input,es?'Solicitud de presupuesto':'Quote request',32,'Bold');text(input,es?'ID · email · mensaje':'ID · email · message',27,'Regular','muted');
  const gate=box(f,w,'VERTICAL','ink',24,10);gate.cornerRadius=16;text(gate,es?'¿Completa y sin duplicados?':'Complete and not duplicated?',32,'Bold','white');
  for(const [title,body,color]of [[es?'SÍ → Actualiza una vez':'YES → Update once',es?'Ficha CRM + responsable':'CRM record + owner','green'],[es?'NO → Revisión humana':'NO → Human review',es?'Dato ausente · reintento con el mismo ID':'Missing field · retry with the same ID','rose']]){const n=box(f,w,'VERTICAL','white',24,12);n.cornerRadius=16;text(n,title,30,'Bold',color);text(n,body,27,'Regular','muted');}
 }else{
  const c=panel(f,w,480,'wash');edge(c,w,480,'M250 236 H384 M544 236 H600 V110 H680','green');edge(c,w,480,'M544 236 H600 V370 H680','rose',true);
  const a=box(c,250,'VERTICAL','white',24,18);a.x=10;a.y=102;a.cornerRadius=16;mono(a,es?'ENTRADA / #1042':'INPUT / #1042',20,'blue');text(a,es?'Solicitud':'Request',35,'Bold');for(const s of ['ID','email',es?'mensaje':'message']){const r=box(a,202,'HORIZONTAL','paper',10,10);text(r,s,24,'Regular','muted',182);}
  const b=box(c,170,'VERTICAL','ink',20,12);b.x=374;b.y=167;b.cornerRadius=20;text(b,es?'¿Datos válidos?':'Valid data?',29,'Bold','white',130);
  for(const [y,title,body,color]of [[20,es?'SÍ / Una sola actualización':'YES / Update once',es?'Ficha CRM + responsable':'CRM record + owner','green'],[300,es?'NO / A revisión':'NO / Review first',es?'Completa el dato. Reintenta con el mismo ID.':'Complete the missing field. Retry with the same ID.','rose']]){const r=box(c,w-690,'VERTICAL','white',24,14);r.x=680;r.y=y;r.cornerRadius=16;text(r,title,30,'Bold',color);text(r,body,26,'Regular','muted');}
 }
 note(f,es?'Ejemplo propuesto. Prueba una entrada correcta, una incompleta y una repetida.':'Proposed example. Test a valid entry, an incomplete entry and a repeated one.');return f;
}
function processFinal(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'infographic',lang,mobile,es?'Cuenta el trabajo terminado.':'Count the completed job.',es?'Las unidades de facturación no son equivalentes.':'Billing units are not interchangeable.');
 const w=f.width-f.paddingLeft*2,calc=box(f,w,'VERTICAL','ink',mobile?24:36,14);calc.cornerRadius=20;
 mono(calc,es?'EJEMPLO HIPOTÉTICO':'HYPOTHETICAL EXAMPLE',21,'white');
 text(calc,es?'300 solicitudes × 4 acciones':'300 requests × 4 actions',mobile?35:50,'Medium','white');text(calc,es?'1.200 acciones':'1,200 actions',mobile?56:90,'Bold','white');
 const units=box(f,w,mobile?'VERTICAL':'HORIZONTAL',null,0,16),uw=mobile?w:(w-32)/3;
 for(const [name,color]of [[es?'Créditos':'Credits','blue'],[es?'Tareas':'Tasks','violet'],[es?'Ejecuciones':'Executions','rose']]){const c=box(units,uw,'VERTICAL','white',22,14);c.cornerRadius=16;const art=panel(c,uw-44,90,'wash');for(let j=0;j<3;j++)rect(art,32+j*11,15+j*15,art.width-86,28,j===2?color:'line',14);text(c,name,32,'Bold',color);}
 const n=box(f,w,'VERTICAL','wash',24,12);n.cornerRadius=16;text(n,es?'Antes de pagar: salida correcta, fallos visibles y responsable claro.':'Before paying: correct output, visible failures and a named owner.',mobile?29:32,'SemiBold');
 note(f,es?'Esta cuenta no es una factura. Aplica las reglas del proveedor y mide consumo, reintentos y costes externos.':'This calculation is not a bill. Apply the provider’s rules and measure usage, retries and external costs.');return f;
}
function claudeCase(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'case',lang,mobile,es?'El pack es solo una capa.':'The pack is only one layer.',es?'Comprar archivos no activa el resto del sistema.':'Buying files does not activate the rest of the system.');
 const w=f.width-f.paddingLeft*2,stack=box(f,w,'VERTICAL',null,0,18);stack.counterAxisAlignItems='CENTER';
 const layers=[[es?'01 / SKILL O PACK':'01 / SKILL OR PACK',es?'Instrucciones y recursos':'Instructions and resources','blue'],[es?'02 / ENTORNO':'02 / ENVIRONMENT',es?'Claude, plan y ejecución compatibles':'Compatible Claude plan and runtime','violet'],[es?'03 / CONEXIONES':'03 / CONNECTIONS',es?'Tus cuentas y permisos':'Your accounts and permissions','rose'],[es?'04 / CONSUMO':'04 / USAGE',es?'APIs, créditos y servicios externos':'APIs, credits and external services','ink']];
 for(let i=0;i<layers.length;i++){const [label,body,color]=layers[i],c=box(stack,mobile?w:w-220+i*70,'VERTICAL',i===3?'ink':'white',mobile?22:26,12);c.cornerRadius=16;mono(c,label,22,i===3?'white':color);text(c,body,mobile?30:36,'SemiBold',i===3?'white':'ink');}
 note(f,es?'En los packs comerciales de esta guía, el pago único anunciado no incluye necesariamente Claude ni el uso de terceros.':'For the commercial packs in this guide, the advertised one-off payment does not necessarily include Claude or third-party usage.');return f;
}
function claudeFinal(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'infographic',lang,mobile,es?'Revisa la entrega, no el chat.':'Review the output, not the chat.',es?'Cuatro archivos. Cuatro pruebas concretas.':'Four files. Four concrete checks.');
 const w=f.width-f.paddingLeft*2,cw=mobile?(w-16)/2:(w-60)/4;
 const data=[['xlsx',es?'Cambia una entrada':'Change an input',es?'Comprueba un total':'Check a total','blue'],['docx',es?'Edita el documento':'Edit the document',es?'Revisa alcance y nombres':'Check scope and names','violet'],['pptx',es?'Abre cada diapositiva':'Open every slide',es?'Busca recortes y fuentes':'Check crops and sources','rose'],['pdf',es?'Extrae un fragmento':'Extract a section',es?'Verifica orden y tablas':'Check order and tables','blue']];
 const rows=mobile?[data.slice(0,2),data.slice(2)]:[data];
 for(const row of rows){const r=box(f,w,'HORIZONTAL',null,0,mobile?16:20);for(const [format,check,detail,color]of row){const c=box(r,cw,'VERTICAL','white',mobile?18:20,16);c.cornerRadius=18;const art=panel(c,cw-(mobile?36:40),160,'wash');paper(art,12,12,art.width-24,136,color,'.'+format);text(c,check,mobile?28:30,'Bold');text(c,detail,mobile?25:26,'Regular','muted');}}
 const end=box(f,w,'VERTICAL','ink',24,8);end.cornerRadius=16;text(end,es?'Conserva la skill si mejora una tarea que realmente repites.':'Keep the skill if it helps a task you actually repeat.',mobile?30:36,'SemiBold','white');
 note(f,es?'Pruebas propuestas, no resultados medidos. Usa muestras autorizadas y comprueba omisiones y correcciones.':'Proposed checks, not measured results. Use authorised samples and check omissions and corrections.');return f;
}
function socialCase(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'case',lang,mobile,es?'Una cola no es un cupo mensual.':'A queue is not a monthly quota.',es?'Dos planes gratuitos. Dos límites distintos.':'Two free plans. Two different limits.');
 const w=f.width-f.paddingLeft*2,body=box(f,w,mobile?'VERTICAL':'HORIZONTAL',null,0,24),cw=mobile?w:(w-24)/2;
 for(const [vendor,count,label,limit,color]of [['Buffer',10,es?'pendientes por canal':'pending per channel',es?'3 canales · 1 usuario':'3 channels · 1 user','blue'],['Metricool',20,es?'publicaciones al mes':'posts per month',es?'1 marca · sin LinkedIn ni X':'1 brand · excludes LinkedIn and X','violet']]){
  const card=box(body,cw,'VERTICAL','white',24,18);card.cornerRadius=18;mono(card,vendor+' / FREE',23,color);
  text(card,String(count),94,'Bold',color);text(card,label,32,'SemiBold');
  const gridW=cw-48;for(let r=0;r<count/5;r++){const row=box(card,gridW,'HORIZONTAL',null,0,9);for(let c=0;c<5;c++){const cell=box(row,(gridW-36)/5,'VERTICAL',color,10,0);cell.cornerRadius=8;const t=text(cell,String(r*5+c+1).padStart(2,'0'),22,'Medium','white');t.textAlignHorizontal='CENTER';}}
  text(card,limit,25,'Regular','muted');
 }
 note(f,es?'Planes revisados el 18/10/2026. Ilustración de capacidad, no captura del producto. Comprueba las condiciones actuales.':'Plans checked 18 Oct 2026. Capacity illustration, not a product screenshot. Check current conditions.');return f;
}
function socialFinal(lang,mobile){
 const es=lang==='es',f=rootFrame(KIND,'infographic',lang,mobile,es?'Aprobar no es publicar.':'Approved is not published.',es?'Cierra el recorrido, incluida la excepción.':'Complete the cycle, including exceptions.');
 const w=f.width-f.paddingLeft*2;
 const steps=[[es?'Preparar':'Prepare',es?'Texto, pieza y fuente':'Copy, asset and source','files','blue'],[es?'Aprobar':'Approve',es?'Persona + versión final':'Person + final version','people','violet'],[es?'Programar':'Schedule',es?'Canal, fecha y zona horaria':'Channel, date and time zone','calendar','rose'],[es?'Confirmar':'Confirm',es?'La pieza aparece en la red':'The post appears on the channel','bridge','green']];
 const body=box(f,w,mobile?'VERTICAL':'HORIZONTAL',null,0,mobile?16:18),cw=mobile?w:(w-54)/4;
 for(let i=0;i<steps.length;i++){const [title,bodyText,art,color]=steps[i],card=box(body,cw,'VERTICAL','white',mobile?20:18,14);card.cornerRadius=16;
  if(mobile){const row=box(card,cw-40,'HORIZONTAL',null,0,20);miniArt(row,140,art,color);const labels=box(row,cw-200,'VERTICAL',null,0,12);mono(labels,'0'+(i+1),21,color);text(labels,title,31,'Bold');text(labels,bodyText,26,'Regular','muted');}
  else{mono(card,'0'+(i+1),21,color);miniArt(card,cw-36,art,color);text(card,title,31,'Bold');text(card,bodyText,26,'Regular','muted');}
 }
 const stop=box(f,w,'VERTICAL','ink',24,10);stop.cornerRadius=16;mono(stop,es?'SI CAMBIA EL CONTEXTO':'IF THE CONTEXT CHANGES',21,'white');text(stop,es?'Pausa → corrige → vuelve a aprobar':'Pause → correct → approve again',mobile?31:40,'SemiBold','white');
 note(f,es?'Flujo propuesto. Conserva textos, archivos, enlaces y resultados para corregir o cambiar de herramienta.':'Proposed workflow. Retain copy, files, links and results so you can correct a post or change tools.');return f;
}
const frames=[];
for(const lang of LANGUAGES)for(const mobile of [false,true]){
 frames.push(atlas(lang,mobile));
 frames.push(KIND==='processes'?processCase(lang,mobile):KIND==='claude'?claudeCase(lang,mobile):socialCase(lang,mobile));
 frames.push(KIND==='processes'?processFinal(lang,mobile):KIND==='claude'?claudeFinal(lang,mobile):socialFinal(lang,mobile));
}
return {createdNodeIds:created,mutatedNodeIds:[],pageId:page.id,frames:frames.map(f=>({id:f.id,name:f.name,width:f.width,height:f.height,textNodes:f.findAllWithCriteria({types:['TEXT']}).length})),fontFamilies:[...new Set(frames.flatMap(f=>f.findAllWithCriteria({types:['TEXT']}).map(t=>t.fontName.family)))]};
