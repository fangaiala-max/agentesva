"""Build exact editorial diagrams, using outlined DM Sans from the site's font.

SVG files are the vector masters. Text equivalents live beside each figure in
the articles. Outlines keep standalone exports independent of installed fonts.
"""
from pathlib import Path
from xml.sax.saxutils import escape
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
import hashlib, json

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'public/images/guides/buying'
FONT = ROOT / 'node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2'
INK, PAPER, BLUE, VIOLET, ROSE, MUTED = '#171A2B', '#FAF9FF', '#315BDA', '#6944BF', '#963D88', '#595F75'
fonts = {}
for weight in [400, 550, 650]:
    f = instantiateVariableFont(TTFont(FONT), {'wght': weight}, inplace=False)
    fonts[weight] = (f, f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm)

def width(s, size, weight=400):
    _, gs, cm, units = fonts[weight]
    return sum(gs[cm.get(ord(c), '.notdef')].width for c in s) * size / units

def text(x, y, s, size=30, color=INK, weight=400):
    _, gs, cm, units = fonts[weight]
    scale = size / units
    parts = [f'<g aria-label="{escape(s)}" fill="{color}">']
    for c in s:
        glyph = gs[cm.get(ord(c), '.notdef')]
        pen = SVGPathPen(gs)
        glyph.draw(pen)
        if pen.getCommands():
            parts.append(f'<path transform="translate({x:.2f},{y}) scale({scale:.6f},-{scale:.6f})" d="{pen.getCommands()}"/>')
        x += glyph.width * scale
    return ''.join(parts) + '</g>'

def wrap(s, max_width, size=30, weight=400):
    lines, line = [], ''
    for word in s.split():
        nxt = (line + ' ' + word).strip()
        if line and width(nxt, size, weight) > max_width:
            lines.append(line)
            line = word
        else:
            line = nxt
    if line:
        lines.append(line)
    return lines

def block(x, y, s, max_width, size=30, color=INK, weight=400, leading=1.3):
    lines = wrap(s, max_width, size, weight)
    return ''.join(text(x, y + i*size*leading, line, size, color, weight) for i,line in enumerate(lines)), len(lines)*size*leading

def rect(x,y,w,h,color,rx=0,stroke=None):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{color}"' + (f' stroke="{stroke}"' if stroke else '') + '/>'

def arrow(x,y,length=20,vertical=False):
    shape = f'M0 0V{length}M-5 {length-5}L0 {length}L5 {length-5}' if vertical else f'M0 0H{length}M{length-5} -5L{length} 0L{length-5} 5'
    return f'<path d="{shape}" transform="translate({x},{y})" fill="none" stroke="{VIOLET}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'

COPY = {
 'processes': {
  'es': {
   'label':'01 / PROCESOS', 'title':'Empieza por el trabajo.', 'sub':'Una ruta para elegir sin comprar de más.',
   'rows':[
    ('Una aplicación','Empieza con su función nativa.','Airtable · Power Automate','Comprueba los derechos de tu licencia.'),
    ('Varias aplicaciones','Conecta entradas, reglas y salidas.','Make · Zapier','Mide consumo y trata las excepciones.'),
    ('Control técnico','Añade APIs o lógica propia.','n8n · Activepieces · Apps Script','Asigna quién mantiene y recupera el flujo.')],
   'close':'Antes de pagar, completa una prueba.', 'checks':['Salida correcta','Fallo visible','Coste medido','Responsable claro'],
   'note':'Autoalojar sin coste de licencia también exige operación. Selección por encaje; no ranking de rendimiento.',
   'flowTitle':'Un flujo también necesita una salida para el error.',
   'steps':['Entrada','Comprobación','Acción preparada','Revisión','Resultado confirmado'],
   'exceptions':'Si falta algo: registra el caso, asigna responsable y reintenta sin duplicar.',
  },
  'en': {
   'label':'01 / WORKFLOWS','title':'Start with the job.','sub':'A route to choosing only what you need.',
   'rows':[
    ('One application','Try its built-in automation first.','Airtable · Power Automate','Check what your existing licence covers.'),
    ('Several applications','Connect inputs, rules and outputs.','Make · Zapier','Measure usage and handle exceptions.'),
    ('Technical control','Add APIs or your own logic.','n8n · Activepieces · Apps Script','Assign an owner for upkeep and recovery.')],
   'close':'Complete a useful test before paying.','checks':['Correct output','Visible failures','Measured cost','Named owner'],
   'note':'No licence fee does not remove operating costs. These are fit-based suggestions, not a performance ranking.',
   'flowTitle':'A workflow also needs a way to handle failure.',
   'steps':['Input','Validation','Prepared action','Review','Confirmed result'],
   'exceptions':'If something is missing: record the case, assign an owner and retry without duplicates.',
  }},
 'claude':{
  'es':{
   'label':'02 / CLAUDE','title':'Añade una capacidad útil.','sub':'La tarea decide qué skill merece quedarse.',
   'rows':[
    ('Archivos de trabajo','Empieza por la capacidad incluida.','xlsx · docx · pptx · pdf','Revisa el archivo, no solo la respuesta.'),
    ('Tu propio método','Convierte ejemplos en un procedimiento.','skill-creator','Compara resultados con y sin la skill.'),
    ('Un trabajo especializado','Selecciona un método para el oficio.','Marketing Skills · frontend-design · Superpowers','Elige por la tarea, no por el tamaño del pack.'),
    ('Conexiones preparadas','Evalúa si evitan preparación real.','Creator: 39 USD · Founder Ops: 79 USD','Pago único anunciado; APIs externas aparte.')],
   'close':'El paquete no es todo el coste.','checks':['Entorno compatible','Dependencias claras','Muestra revisable','Mantenimiento'],
   'note':'Precios del vendedor, revisados el 18/10/2026. Packs de pago sin compra ni prueba comparativa por AgentesVA.',
   'flowTitle':'Una skill conecta un método con una entrega.',
   'steps':['Tu tarea','Método','Recursos','Herramientas','Salida revisable'],
   'exceptions':'Instalar más skills no es la métrica: comprueba omisiones, correcciones y utilidad.',
  },
  'en':{
   'label':'02 / CLAUDE','title':'Add a useful capability.','sub':'Let the job decide which skill earns its place.',
   'rows':[
    ('Work files','Start with the included capability.','xlsx · docx · pptx · pdf','Review the file, not just the reply.'),
    ('Your own method','Turn examples into a repeatable process.','skill-creator','Compare outputs with and without the skill.'),
    ('Specialist work','Choose a method that fits the job.','Marketing Skills · frontend-design · Superpowers','Choose by the task, not the size of the pack.'),
    ('Ready-made connections','Check what setup they actually remove.','Creator: USD 39 · Founder Ops: USD 79','Advertised one-off fee; external APIs extra.')],
   'close':'The package is not the whole cost.','checks':['Compatible setup','Clear dependencies','Reviewable sample','Maintenance'],
   'note':'Vendor prices checked 18 Oct 2026. AgentesVA has not purchased or comparatively tested the paid packs.',
   'flowTitle':'A skill connects a method to a useful output.',
   'steps':['Your task','Method','Resources','Tools','Reviewable output'],
   'exceptions':'More installed skills is not the goal: check omissions, corrections and usefulness.',
  }},
 'social':{
  'es':{
   'label':'03 / REDES SOCIALES','title':'Resuelve el cuello de botella.','sub':'Programar es una etapa. Publicar bien es un ciclo.',
   'rows':[
    ('Solo Facebook e Instagram','Prueba primero la herramienta nativa.','Meta Business Suite','Confirma formatos y conexión de cuentas.'),
    ('Una cola pequeña','Organiza contenido ya aprobado.','Buffer · Publer','Un límite de cola no es un cupo mensual.'),
    ('Marcas e informes','Reúne calendario y resultados.','Metricool','Free: 20 publicaciones al mes; revisa redes.'),
    ('Visual o reutilizable','Elige por la forma de producir.','Later: visual · SocialBee: biblioteca','Comprueba perfiles y vigencia de las piezas.'),
    ('Coordinación y atención','Prueba el recorrido entre personas.','Hootsuite','Verifica plan, permisos, asientos y coste.')],
   'close':'Antes de pagar, cierra el ciclo.','checks':['Pieza revisada','Publicación confirmada','Coste por equipo','Activos conservados'],
   'note':'Planes revisados el 18/10/2026. La selección no demuestra cambios de alcance, ventas o fiabilidad.',
   'flowTitle':'Del borrador a una publicación confirmada.',
   'steps':['Idea','Adaptación','Aprobación','Programación','Confirmación'],
   'exceptions':'Si cambia el contexto, corrige o retira la pieza. Después revisa respuesta y visitas.',
  },
  'en':{
   'label':'03 / SOCIAL MEDIA','title':'Fix the bottleneck.','sub':'Scheduling is one stage. Publishing well is a cycle.',
   'rows':[
    ('Facebook and Instagram only','Try the native tool first.','Meta Business Suite','Check formats and account connections.'),
    ('A small publishing queue','Organise content that is already approved.','Buffer · Publer','A queue limit is not a monthly allowance.'),
    ('Brands and reporting','Bring the calendar and results together.','Metricool','Free: 20 posts a month; check networks.'),
    ('Visual or reusable content','Choose by how you produce.','Later: visual · SocialBee: library','Check profiles and whether content is current.'),
    ('Coordination and care','Test the handoff between people.','Hootsuite','Check plan, access, seats and total cost.')],
   'close':'Complete the cycle before paying.','checks':['Reviewed content','Confirmed publication','Team-level cost','Assets retained'],
   'note':'Plans checked 18 Oct 2026. This selection is not evidence of reach, sales or reliability improvements.',
   'flowTitle':'From a draft to a confirmed publication.',
   'steps':['Idea','Adaptation','Approval','Scheduling','Confirmation'],
   'exceptions':'If the context changes, correct or remove the post. Then review responses and visits.',
  }}
}

def infographic(kind,lang,mobile):
    c=COPY[kind][lang]; w=600 if mobile else 1200; pad=36 if mobile else 70
    head=370 if mobile else 310; row_h=370 if mobile else 280
    foot=520 if mobile else 400
    h=head+len(c['rows'])*row_h+foot
    p=[rect(0,0,w,h,PAPER),rect(0,0,w,head,INK)]
    p.append(text(pad,62,c['label'],20 if mobile else 22,'#B8C7FF',550))
    s,hh=block(pad,125,c['title'],w-2*pad,44 if mobile else 65,'#FAF9FF',650);p.append(s)
    s,_=block(pad,125+hh+28,c['sub'],w-2*pad,27 if mobile else 32,'#DCE0F0');p.append(s)
    for i,(label,desc,tools,note) in enumerate(c['rows']):
        top=head+i*row_h
        p.append(rect(pad,top+24,w-pad*2,row_h-32,'#FFFFFF',14,stroke='#D8D9E8'))
        accent=[BLUE,VIOLET,ROSE,BLUE,VIOLET][i]
        p.append(rect(pad,top+24,6,row_h-32,accent,3))
        if mobile:
            p.append(text(pad+24,top+68,f'{i+1:02d}',22,accent,650))
            s,lh=block(pad+24,top+111,label,w-pad*2-48,31,INK,650);p.append(s)
            s,dh=block(pad+24,top+111+lh+9,tools,w-pad*2-48,28,accent,550);p.append(s)
            s,_=block(pad+24,top+111+lh+dh+22,note,w-pad*2-48,26,MUTED);p.append(s)
        else:
            p.append(text(pad+26,top+74,f'{i+1:02d}',24,accent,650))
            s,label_h=block(pad+90,top+76,label,360,35,INK,650);p.append(s)
            s,_=block(pad+90,top+76+label_h+20,desc,360,27,MUTED);p.append(s)
            p.append(arrow(550,top+112))
            s,lh=block(610,top+79,tools,w-610-pad-28,31,accent,550);p.append(s)
            s,_=block(610,top+79+lh+12,note,w-610-pad-28,25,MUTED);p.append(s)
    top=head+len(c['rows'])*row_h+20
    p.append(rect(0,top,w,h-top,INK))
    s,hh=block(pad,top+68,c['close'],w-2*pad,36 if mobile else 48,'#FAF9FF',650);p.append(s)
    cy=top+hh+99
    for i,label in enumerate(c['checks']):
        x=pad if mobile else pad+(i%2)*530
        y=cy+i*42 if mobile else cy+(i//2)*45
        p.append(rect(x,y-17,15,15,'none',3,stroke='#B8C7FF'))
        p.append(text(x+28,y,label,25 if mobile else 28,'#DCE0F0',550))
    note_y=cy+4*42+20 if mobile else cy+2*45+32
    s,_=block(pad,note_y,c['note'],w-2*pad,19 if mobile else 21,'#B9C0D8');p.append(s)
    return w,h,''.join(p),c['title'],c

def diagram(kind,lang,mobile):
    c=COPY[kind][lang];w=600 if mobile else 1200;pad=36 if mobile else 60
    h=1180 if mobile else 660
    p=[rect(0,0,w,h,'#F0EFFA',16)]
    p.append(text(pad,58,'AGENTESVA / FIELD NOTES',20,BLUE,550))
    s,hh=block(pad,112,c['flowTitle'],w-pad*2,39 if mobile else 50,INK,650);p.append(s)
    start=150+hh
    for i,step in enumerate(c['steps']):
        x=pad if mobile else pad+i*218
        y=start+i*137 if mobile else start
        bw=w-pad*2 if mobile else 202;bh=104 if mobile else 155
        p.append(rect(x,y,bw,bh,'#FFF',10,stroke='#D8D9E8'))
        p.append(text(x+20,y+35,f'{i+1:02d}',21,[BLUE,VIOLET,ROSE,BLUE,VIOLET][i],650))
        s,_=block(x+20,y+73,step,bw-40,28,INK,550);p.append(s)
        if i<4:
            p.append(arrow(x+bw/2,y+112,17,True) if mobile else arrow(x+bw+3,y+88,10))
    note_y=start+5*137+20 if mobile else start+220
    s,_=block(pad,note_y,c['exceptions'],w-pad*2,28,MUTED);p.append(s)
    return w,h,''.join(p),c['flowTitle'],c

OUT.mkdir(parents=True,exist_ok=True)
manifest=[]
for kind in COPY:
 for lang in ['es','en']:
  for name,fn in [('infographic',infographic),('flow',diagram)]:
   for mobile in [False,True]:
    w,h,body,title,c=fn(kind,lang,mobile)
    desc=' '.join([' | '.join(r) for r in c['rows']]) if name=='infographic' else ' → '.join(c['steps'])+'. '+c['exceptions']
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>{body}</svg>'
    file=OUT/f"{kind}-{name}-{lang}{'-mobile' if mobile else ''}.svg"
    file.write_text(svg)
    manifest.append({'file':str(file.relative_to(ROOT)),'kind':kind,'language':lang,'format':name,'mobile':mobile,'width':w,'height':h,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'font':'DM Sans, outlined from project font','review':'pending render review'})
(Path(__file__).parent/'asset-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(f'Built {len(manifest)} SVG masters with outlined DM Sans.')
