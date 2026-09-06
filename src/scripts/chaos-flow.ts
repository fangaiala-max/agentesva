/** Animated Beam by dillionverma, 21st.dev demo 919, adapted for Astro + WAAPI.
 * Container-relative SVG paths and ResizeObserver follow the retrieved component.
 * The task choreography, timing, pause controls and lifecycle are project-specific.
 */
export function setupChaosFlow(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-flow-stage]')!;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-node]'));
  const beams = Array.from(root.querySelectorAll<SVGPathElement>('[data-flow-beam]'));
  const tracks = Array.from(root.querySelectorAll<SVGPathElement>('[data-flow-track]'));
  const pause = root.querySelector<HTMLButtonElement>('[data-flow-pause]')!;
  const replay = root.querySelector<HTMLButtonElement>('[data-flow-replay]')!;
  const status = root.querySelector<HTMLElement>('[data-flow-status]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animations: Animation[] = [];
  let frame = 0, started = false, finished = true, visible = false, userPaused = false, disposed = false;
  const duration = 6500;
  const cancel = () => { cancelAnimationFrame(frame); frame = 0; animations.forEach(a => a.cancel()); animations = []; };
  // Measure resting positions: CSS left/top are anchors, independent of animated transforms.
  const draw = () => {
    const box = stage.getBoundingClientRect();
    const centers = nodes.map(node => {
      const style = getComputedStyle(node);
      return { x: parseFloat(style.left), y: parseFloat(style.top) };
    });
    root.querySelector('svg')!.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    beams.forEach((beam, i) => {
      const a = centers[i < 3 ? i : 3], b = centers[i < 3 ? 3 : 4];
      const vertical = window.innerWidth <= 600;
      const d = vertical ? `M ${a.x} ${a.y} Q ${a.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}` : `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${a.y} ${b.x} ${b.y}`;
      beam.setAttribute('d', d); tracks[i].setAttribute('d', d);
    });
  };
  const phase = (name: string, text: string) => { if (root.dataset.phase !== name) { root.dataset.phase = name; status.textContent = text; } };
  const complete = () => {
    cancel(); finished = true; userPaused = false;
    phase('review', 'Ready for human review.');
    pause.disabled = true; pause.textContent = 'Pause'; pause.setAttribute('aria-pressed', 'false');
    replay.disabled = reduced.matches; draw();
  };
  const tick = () => {
    frame = 0;
    if (disposed || finished) return;
    const time = Number(animations[0]?.currentTime ?? 0);
    if (time >= duration) { complete(); return; }
    if (time >= 4700) phase('review', 'Ready for human review.');
    else if (time >= 1800) phase('connected', 'One connected workflow.');
    if (visible && !document.hidden && !userPaused) frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (finished || disposed) return;
    const stopped = userPaused || !visible || document.hidden;
    animations.forEach(a => stopped ? a.pause() : a.play());
    cancelAnimationFrame(frame); frame = 0;
    if (!stopped) frame = requestAnimationFrame(tick);
    pause.textContent = userPaused ? 'Resume' : 'Pause';
    pause.setAttribute('aria-pressed', String(userPaused));
  };
  const start = () => {
    cancel(); started = true;
    if (reduced.matches) { complete(); return; }
    finished = false; userPaused = false; pause.disabled = false; replay.disabled = true;
    phase('chaos', 'Scattered tasks. Waiting for a system.'); draw();
    // A clock animation keeps pause, visibility and all motion on the same timeline.
    animations.push(stage.animate([{opacity:1},{opacity:1}], {duration,fill:'both'}));
    const compact = window.innerWidth <= 600;
    nodes.slice(0,3).forEach((node,i) => {
      const offsets = compact ? [[10,18,-8],[-4,58,9],[-13,24,-5]] : [[72,48,-12],[32,-18,8],[110,-24,-7]];
      const [x,y,angle] = offsets[i];
      animations.push(node.animate([
        {transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}deg)`},
        {transform:'translate(-50%, -50%) rotate(0deg)'},
      ], {duration:1600,delay:250+i*160,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
    });
    beams.forEach((beam,i) => {
      animations.push(beam.animate([{strokeDashoffset:'100',opacity:0},{strokeDashoffset:'85',opacity:1,offset:.15},{strokeDashoffset:'0',opacity:0}], {duration:1500,delay:i<3?1900+i*280:3850,iterations:1,fill:'both',easing:'ease-in-out'}));
    });
    animations.push(nodes[4].animate([{opacity:.3,filter:'blur(2px)'},{opacity:1,filter:'blur(0px)'}],{duration:900,delay:4400,fill:'both'}));
    sync();
  };
  const toggle = () => {userPaused = !userPaused; sync();};
  const motionChange = () => {if(reduced.matches)complete();else replay.disabled=false;};
  const resize = new ResizeObserver(draw); resize.observe(stage);
  const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if(visible&&!started)start();else sync(); },{threshold:.2}); observer.observe(root);
  pause.addEventListener('click',toggle); replay.addEventListener('click',start);
  reduced.addEventListener('change',motionChange); document.addEventListener('visibilitychange',sync);
  draw(); replay.disabled = reduced.matches;
  return () => {disposed=true;cancel();resize.disconnect();observer.disconnect();pause.removeEventListener('click',toggle);replay.removeEventListener('click',start);reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',sync);};
}
