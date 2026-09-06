import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {setupChaosFlow} from '../src/scripts/chaos-flow';
let cleanup=()=>{};
const originalAnimate=Object.getOwnPropertyDescriptor(Element.prototype,'animate');
let reduced=false;
let intersect:(entries:any[])=>void;
let motionChange:()=>void;
let animations:any[];
let root:HTMLElement;
beforeEach(()=>{
 vi.useFakeTimers();animations=[];reduced=false;
 vi.stubGlobal('matchMedia',()=>({get matches(){return reduced;},addEventListener:(_name:string,fn:()=>void)=>{motionChange=fn;},removeEventListener:vi.fn()}));
 vi.stubGlobal('IntersectionObserver',class{constructor(fn:any){intersect=fn;}observe(){}disconnect(){}});
 vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
 vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>setTimeout(()=>fn(0),16));
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>clearTimeout(id));
 Object.defineProperty(Element.prototype,'animate',{configurable:true,value:vi.fn(()=>{const a={currentTime:0,pause:vi.fn(),play:vi.fn(),cancel:vi.fn()};animations.push(a);return a as unknown as Animation;})});
 document.body.innerHTML=`<figure data-chaos-flow data-phase="review"><div data-flow-stage><svg>${[0,1,2,3].map(i=>`<path data-flow-track="${i}"></path><path data-flow-beam="${i}"></path>`).join('')}</svg>${[0,1,2,3,4].map(i=>`<div data-flow-node="${i}" style="left:${i*30}px;top:30px"></div>`).join('')}</div><p data-flow-status></p><button data-flow-pause disabled></button><button data-flow-replay disabled></button></figure>`;
 root=document.querySelector('figure')!;cleanup=setupChaosFlow(root);
});
afterEach(()=>{cleanup();if(originalAnimate)Object.defineProperty(Element.prototype,'animate',originalAnimate);else Reflect.deleteProperty(Element.prototype,'animate');vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();document.body.innerHTML='';});
const click=(name:string)=>root.querySelector<HTMLButtonElement>(`[data-flow-${name}]`)!.click();
it('honors pause across offscreen and visible transitions',()=>{
 intersect([{isIntersecting:true}]);click('pause');
 const playCounts=animations.map(a=>a.play.mock.calls.length);
 intersect([{isIntersecting:false}]);intersect([{isIntersecting:true}]);
 expect(animations.map(a=>a.play.mock.calls.length)).toEqual(playCounts);
 expect(root.querySelector('[data-flow-pause]')?.getAttribute('aria-pressed')).toBe('true');
 click('pause');expect(animations.every((a,i)=>a.play.mock.calls.length>playCounts[i])).toBe(true);
});
it('completes statically when reduced motion changes during playback',()=>{
 intersect([{isIntersecting:true}]);reduced=true;motionChange();
 expect(animations.every(a=>a.cancel.mock.calls.length>0)).toBe(true);
 expect(root.dataset.phase).toBe('review');expect(root.querySelector<HTMLButtonElement>('[data-flow-replay]')!.disabled).toBe(true);
 expect(vi.getTimerCount()).toBe(0);
});
it('renders reduced motion without creating animations',()=>{
 reduced=true;intersect([{isIntersecting:true}]);expect(animations).toHaveLength(0);expect(root.dataset.phase).toBe('review');
});
it('finishes once, replays, and cancels all work on teardown',()=>{
 intersect([{isIntersecting:true}]);animations[0].currentTime=6500;vi.advanceTimersByTime(16);
 expect(root.dataset.phase).toBe('review');expect(vi.getTimerCount()).toBe(0);
 click('replay');expect(root.dataset.phase).toBe('chaos');cleanup();
 expect(animations.every(a=>a.cancel.mock.calls.length>0)).toBe(true);expect(vi.getTimerCount()).toBe(0);
 const count=animations.length;click('replay');expect(animations).toHaveLength(count);
});
