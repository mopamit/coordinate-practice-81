const modes=[
 {title:'חוקרים נקודות',short:'מסמנים, גוררים ובודקים מרחקים',icon:'✦',explore:true},
 {title:'מסמנים נקודה',short:'מקבלים זוג סדור ומסמנים במערכת',icon:'●'},
 {title:'קוראים נקודה',short:'רואים נקודה וכותבים את שיעוריה',icon:'⌖'},
 {title:'מזיזים נקודה',short:'עוקבים אחרי שינוי במיקום',icon:'↔'}
];
const placeTasks=[{x:3,y:5},{x:7,y:2},{x:4,y:8},{x:9,y:6},{x:2,y:9},{x:6,y:4}];
const readTasks=[{x:2,y:6},{x:8,y:3},{x:5,y:9},{x:7,y:7},{x:1,y:4},{x:9,y:2}];
const moveTasks=[
 {start:{x:3,y:2},dx:0,dy:5,text:'הזיזו את הנקודה 5 יחידות למעלה.',options:[{x:3,y:7},{x:8,y:2},{x:3,y:5},{x:2,y:7}]},
 {start:{x:7,y:6},dx:-4,dy:0,text:'הזיזו את הנקודה 4 יחידות שמאלה.',options:[{x:3,y:6},{x:7,y:2},{x:4,y:6},{x:3,y:2}]},
 {start:{x:2,y:7},dx:5,dy:0,text:'הזיזו את הנקודה 5 יחידות ימינה.',options:[{x:7,y:7},{x:2,y:2},{x:5,y:7},{x:7,y:2}]},
 {start:{x:8,y:8},dx:0,dy:-6,text:'הזיזו את הנקודה 6 יחידות למטה.',options:[{x:8,y:2},{x:2,y:8},{x:8,y:6},{x:2,y:2}]},
 {start:{x:4,y:3},dx:3,dy:4,text:'הזיזו את הנקודה 3 יחידות ימינה ו־4 יחידות למעלה.',options:[{x:7,y:7},{x:7,y:4},{x:8,y:6},{x:1,y:7}]},
 {start:{x:9,y:7},dx:-5,dy:-3,text:'הזיזו את הנקודה 5 יחידות שמאלה ו־3 יחידות למטה.',options:[{x:4,y:4},{x:6,y:2},{x:4,y:10},{x:5,y:3}]}
];
const pointColors=['#087f78','#d8792c','#7756a8','#2977a8','#b44f6b','#5d8a32','#a86b1f','#4b6fc0','#9b4d96','#4a8585'];
let state={mode:0,task:0,picked:null,x:'',y:'',choice:null,help:false,feedback:null,done:[false,false,false],finished:false,explorePoints:[],measureMode:false,measureFirst:null,measureSecond:null};
const GRID=10,SIZE=620,PAD=52,STEP=(SIZE-PAD*2)/GRID,sx=x=>PAD+x*STEP,sy=y=>SIZE-PAD-y*STEP,pt=p=>`(${p.x}, ${p.y})`;
const $=s=>document.querySelector(s);
function resetExercise(){state.picked=null;state.x='';state.y='';state.choice=null;state.help=false;state.feedback=null;}
function restart(){state={mode:0,task:0,picked:null,x:'',y:'',choice:null,help:false,feedback:null,done:[false,false,false],finished:false,explorePoints:[],measureMode:false,measureFirst:null,measureSecond:null};render();}
function switchMode(i){state.mode=i;state.task=0;state.finished=false;state.measureMode=false;state.measureFirst=null;state.measureSecond=null;resetExercise();render();}
function destination(){const t=moveTasks[state.task];return{x:t.start.x+t.dx,y:t.start.y+t.dy};}
function same(a,b){return a&&b&&a.x===b.x&&a.y===b.y;}
function exerciseIndex(){return state.mode-1;}
function pointName(index){
 const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 if(index<letters.length)return letters[index];
 return `P${index+1}`;
}
function gridPointFromEvent(e,board){
 const r=board.getBoundingClientRect();
 const px=(e.clientX-r.left)/r.width*SIZE;
 const py=(e.clientY-r.top)/r.height*SIZE;
 return{
  x:Math.max(0,Math.min(10,Math.round((px-PAD)/STEP))),
  y:Math.max(0,Math.min(10,Math.round((SIZE-PAD-py)/STEP)))
 };
}
function addExplorePoint(p){
 const i=state.explorePoints.length;
 state.explorePoints.push({x:p.x,y:p.y,name:pointName(i),color:pointColors[i%pointColors.length],help:false,showPoint:false});
}
function check(){
 if(state.mode===1){const t=placeTasks[state.task]; if(!state.picked) state.feedback={ok:false,text:'סמנו קודם נקודה על מערכת הצירים.'}; else if(same(state.picked,t)) state.feedback={ok:true,text:`מצוין! סימנתם נכון את הנקודה ${pt(t)}.`}; else state.feedback={ok:false,text:'עדיין לא. אפשר להזיז את הסימון ולבדוק שוב.'};}
 else if(state.mode===2){const t=readTasks[state.task]; if(state.x.trim()===''||state.y.trim()==='') state.feedback={ok:false,text:'כתבו גם את שיעור x וגם את שיעור y.'}; else if(Number(state.x)===t.x&&Number(state.y)===t.y) state.feedback={ok:true,text:`נכון! הנקודה היא ${pt(t)}.`}; else if(Number(state.x)===t.y&&Number(state.y)===t.x) state.feedback={ok:false,text:'נראה שהחלפתם בין x ל־y. זכרו: x נכתב ראשון.'}; else state.feedback={ok:false,text:'עדיין לא. בדקו את המיקום ביחס לציר x ולציר y ונסו שוב.'};}
 else if(state.mode===3){if(state.choice===null) state.feedback={ok:false,text:'בחרו קודם אחת מהתשובות.'}; else if(same(moveTasks[state.task].options[state.choice],destination())) state.feedback={ok:true,text:`נכון! הנקודה החדשה היא ${pt(destination())}.`}; else state.feedback={ok:false,text:'לא הפעם. חשבו איזה שיעור משתנה ובכמה יחידות, ואז נסו שוב.'};}
 render();
}
function next(){
 if(!state.feedback?.ok)return;
 if(state.task<5){state.task++;resetExercise();render();return;}
 state.done[exerciseIndex()]=true;
 if(state.mode<3){state.mode++;state.task=0;resetExercise();render();}
 else{state.finished=true;render();}
}
function canMeasure(a,b){return a&&b&&(a.x===b.x||a.y===b.y);}
function measurementGroup(a,b){
 const horizontal=a.y===b.y;
 const dist=horizontal?Math.abs(a.x-b.x):Math.abs(a.y-b.y);
 if(!dist)return '';
 const x1=sx(a.x),y1=sy(a.y),x2=sx(b.x),y2=sy(b.y);
 let ticks='';
 for(let i=1;i<dist;i++){
  const x=horizontal?Math.min(x1,x2)+i*STEP:x1;
  const y=horizontal?y1:Math.max(y1,y2)-i*STEP;
  ticks+=horizontal?`<line x1="${x}" y1="${y-7}" x2="${x}" y2="${y+7}" class="measure-tick"/>`:`<line x1="${x-7}" y1="${y}" x2="${x+7}" y2="${y}" class="measure-tick"/>`;
 }
 const mx=(x1+x2)/2,my=(y1+y2)/2;
 const labelX=horizontal?mx:mx+18,labelY=horizontal?my-18:my;
 return `<g class="measurement"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="measure-line"/>${ticks}<g class="measure-label" transform="translate(${labelX} ${labelY})"><rect x="-39" y="-16" width="78" height="30" rx="9"/><text x="0" y="4" text-anchor="middle">${dist} יחידות</text></g></g>`;
}
function eligibleMeasureIndices(){
 if(state.measureFirst===null)return [];
 const a=state.explorePoints[state.measureFirst];
 return state.explorePoints.map((p,i)=>i!==state.measureFirst&&canMeasure(a,p)?i:null).filter(i=>i!==null);
}
function guideGroup(p,color,withLabels=false,index=null){
 const verticalMid=(sy(0)+sy(p.y))/2;
 const horizontalMid=(sx(0)+sx(p.x))/2;
 let labels='';
 if(withLabels){
  if(p.y>0) labels+=`<g class="distance-label" transform="translate(${sx(p.x)+9} ${verticalMid})"><rect x="0" y="-14" width="50" height="24" rx="7"/><text x="25" y="3" text-anchor="middle">${p.y} יח׳</text></g>`;
  if(p.x>0) labels+=`<g class="distance-label" transform="translate(${horizontalMid} ${sy(p.y)-10})"><rect x="-25" y="-14" width="50" height="24" rx="7"/><text x="0" y="3" text-anchor="middle">${p.x} יח׳</text></g>`;
 }
 return `<g class="guides explore-guides" ${index!==null?`data-guide-index="${index}"`:''} style="--guide:${color}"><line class="guide-v" x1="${sx(p.x)}" y1="${sy(0)}" x2="${sx(p.x)}" y2="${sy(p.y)}"/><line class="guide-h" x1="${sx(0)}" y1="${sy(p.y)}" x2="${sx(p.x)}" y2="${sy(p.y)}"/>${labels}</g>`;
}
function baseBoard(inner,interactiveClass=''){
 let g='';for(let i=0;i<=GRID;i++){g+=`<line x1="${sx(i)}" y1="${sy(0)}" x2="${sx(i)}" y2="${sy(10)}" class="grid-line"/><line x1="${sx(0)}" y1="${sy(i)}" x2="${sx(10)}" y2="${sy(i)}" class="grid-line"/>`;}
 let ticks='';for(let i=0;i<=GRID;i++){ticks+=`<text x="${sx(i)}" y="${sy(0)+27}" text-anchor="middle">${i}</text>`;if(i>0)ticks+=`<text x="${sx(0)-20}" y="${sy(i)+5}" text-anchor="middle">${i}</text>`;}
 return `<svg viewBox="0 0 ${SIZE} ${SIZE}" class="board ${interactiveClass}" id="board" role="img" aria-label="מערכת צירים ברביע הראשון"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#18353d"/></marker><marker id="moveArrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e19b21"/></marker></defs><rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="20" fill="#fff" class="board-bg"/>${g}<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(10)+20}" y2="${sy(0)}" class="axis" marker-end="url(#arrow)"/><line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0)}" y2="${sy(10)-20}" class="axis" marker-end="url(#arrow)"/><g class="ticks">${ticks}</g><text x="${sx(10)+26}" y="${sy(0)+28}" class="axis-name">x</text><text x="${sx(0)-22}" y="${sy(10)-23}" class="axis-name">y</text>${inner}</svg>`;
}
function boardSVG(){
 if(state.mode===0){
  const guides=state.explorePoints.map((p,i)=>p.help?guideGroup(p,p.color,true,i):'').join('');
  const eligible=eligibleMeasureIndices();
  const measurement=(state.measureFirst!==null&&state.measureSecond!==null)?measurementGroup(state.explorePoints[state.measureFirst],state.explorePoints[state.measureSecond]):'';
  const points=state.explorePoints.map((p,i)=>{
   let measureClass='';
   if(state.measureMode){
    if(i===state.measureFirst)measureClass=' measure-first';
    else if(i===state.measureSecond)measureClass=' measure-second';
    else if(state.measureFirst===null||eligible.includes(i))measureClass=' measure-eligible';
    else measureClass=' measure-dim';
   }
   return `<g class="explore-point-group${measureClass}" data-point-index="${i}" style="--point-color:${p.color}"><circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="18" class="drag-hit"/><circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="11" class="explore-point"/>${state.measureMode&&(i===state.measureFirst||i===state.measureSecond||state.measureFirst===null||eligible.includes(i))?`<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="18" class="measure-ring"/>`:''}<text x="${sx(p.x)+15}" y="${sy(p.y)-14}" class="point-name">${p.name}</text>${p.showPoint?`<text x="${sx(p.x)+15}" y="${sy(p.y)+8}" class="point-value">${pt(p)}</text>`:''}</g>`;
  }).join('');
  return baseBoard(guides+measurement+points,`interactive explore-board ${state.measureMode?'measure-mode':''}`);
 }
 const interactive=state.mode===1&&!state.feedback?.ok;
 let fixed=[],selected=null,guide=null,dest=null,line=null;
 if(state.mode===1){selected=state.picked;guide=state.help?state.picked:null;}
 if(state.mode===2){fixed=[readTasks[state.task]];guide=state.help?readTasks[state.task]:null;}
 if(state.mode===3){fixed=[moveTasks[state.task].start];if(state.feedback?.ok){dest=destination();line={from:moveTasks[state.task].start,to:dest};}}
 let guideHtml=guide?`<g class="guides"><line x1="${sx(guide.x)}" y1="${sy(0)}" x2="${sx(guide.x)}" y2="${sy(guide.y)}"/><line x1="${sx(0)}" y1="${sy(guide.y)}" x2="${sx(guide.x)}" y2="${sy(guide.y)}"/></g>`:'';
 let fixedHtml=fixed.map(p=>`<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="9" class="point fixed-point"/>`).join('');
 let selHtml=selected?`<circle cx="${sx(selected.x)}" cy="${sy(selected.y)}" r="11" class="point selected-point"/><circle cx="${sx(selected.x)}" cy="${sy(selected.y)}" r="17" class="selection-ring"/>`:'';
 let moveHtml=line?`<line x1="${sx(line.from.x)}" y1="${sy(line.from.y)}" x2="${sx(line.to.x)}" y2="${sy(line.to.y)}" class="move-line" marker-end="url(#moveArrow)"/>`:'';
 let destHtml=dest?`<circle cx="${sx(dest.x)}" cy="${sy(dest.y)}" r="10" class="destination-point"/>`:'';
 return baseBoard(guideHtml+moveHtml+fixedHtml+selHtml+destHtml,interactive?'interactive':'');
}
function renderNav(){
 $('#modeNav').innerHTML=modes.map((m,i)=>{
  const ex=i-1;
  const completed=i>0&&state.done[ex];
  return `<button data-mode="${i}" class="${state.mode===i?'active':''} ${completed?'done':''}"><span class="lesson-icon">${completed?'✓':m.icon}</span><span><strong>${m.title}</strong><small>${m.short}</small></span></button>`;
 }).join('');
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(Number(b.dataset.mode)));
}
function feedbackHTML(){if(!state.feedback)return'';return`<div class="feedback-card ${state.feedback.ok?'success':'error'}"><strong>${state.feedback.ok?'נכון!':'נסו שוב'}</strong><span>${state.feedback.text}</span></div>`;}
function explorePanelHTML(){
 const list=state.explorePoints.length?state.explorePoints.map((p,i)=>`<article class="point-row" style="--point-color:${p.color}">
   <div class="point-row-head"><span class="point-swatch"></span><strong>${p.name} = <bdi>${pt(p)}</bdi></strong><button class="delete-point" data-delete-point="${i}" title="מחיקת הנקודה" aria-label="מחיקת הנקודה ${p.name}" ${state.measureMode?'disabled':''}>×</button></div>
   <div class="point-row-actions"><button class="point-help ${p.help?'active':''}" data-point-help="${i}" ${state.measureMode?'disabled':''}>${p.help?'הסתר קווי עזר':'הצג קווי עזר'}</button><button class="point-help ${p.showPoint?'active':''}" data-show-point="${i}" ${state.measureMode?'disabled':''}>${p.showPoint?'הסתר ערך ליד הנקודה':'הצג ערך ליד הנקודה'}</button></div>
  </article>`).join(''):`<div class="explore-empty">לחצו על אחת מנקודות החיתוך במערכת הצירים כדי ליצור את <strong>הנקודה A</strong>.</div>`;
 let measureInfo='';
 if(state.measureMode){
  if(state.measureFirst===null)measureInfo=`<div class="measure-info"><strong>בחרו נקודה ראשונה</strong><small>אחר כך יודגשו רק נקודות שנמצאות איתה באותו קו אופקי או אנכי.</small></div>`;
  else if(state.measureSecond===null){
   const a=state.explorePoints[state.measureFirst],eligible=eligibleMeasureIndices();
   measureInfo=eligible.length?`<div class="measure-info"><strong>בחרתם את ${a.name}</strong><small>עכשיו בחרו אחת מהנקודות המודגשות — רק נקודה עם אותו x או אותו y. לחיצה במקום ריק תבטל את הבחירה.</small></div>`:`<div class="measure-info warning"><strong>אין כרגע נקודה מתאימה ל־${a.name}</strong><small>לחצו במקום ריק בגרף כדי לבטל את הבחירה ולבחור נקודה אחרת.</small></div>`;
  } else {
   const a=state.explorePoints[state.measureFirst],b=state.explorePoints[state.measureSecond];
   const dist=a.x===b.x?Math.abs(a.y-b.y):Math.abs(a.x-b.x);
   measureInfo=`<div class="measure-info result"><strong>${a.name} ↔ ${b.name}: ${dist} יחידות</strong><small>המרחק מוצג גם ישירות על מערכת הצירים. לחצו על נקודה אחרת כדי להתחיל מדידה חדשה.</small></div>`;
  }
 }
 return `<div class="task-kicker">שלב הכנה</div><h2>חוקרים נקודות</h2><p>סמנו נקודות חופשי על המערכת. כל נקודה תקבל שם וצבע משלה. אפשר לתפוס כל נקודה ולגרור אותה למקום חדש.</p>
 <div class="explore-tip"><span>↔</span><div><strong>נסו לגרור נקודה</strong><small>הזוג הסדור שלה יתעדכן מיד.</small></div></div>
 <button id="measureToggle" class="measure-toggle ${state.measureMode?'active':''}" ${state.explorePoints.length?'':'disabled'}><span>↔</span>${state.measureMode?'יציאה ממדידת מרחק':'מדידת מרחק בין נקודות'}</button>
 ${measureInfo}
 <div class="point-list">${list}</div>
 <div class="explore-actions"><button id="clearPoints" class="secondary" ${state.explorePoints.length&&!state.measureMode?'':'disabled'}>נקה את כל הנקודות</button><button id="startPractice" class="primary">לעבור לתרגול ←</button></div>`;
}
function taskHTML(){
 if(state.mode===0)return explorePanelHTML();
 let body='';
 if(state.mode===1){const t=placeTasks[state.task];body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>סמנו את הנקודה</h2><div class="target-pair">${pt(t)}</div><p>לחצו במקום המתאים על מערכת הצירים. רק לאחר מכן לחצו על „בדיקה”.</p>`;}
 if(state.mode===2){body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>מהם שיעורי הנקודה?</h2><p>קראו את מיקום הנקודה וכתבו את הזוג הסדור. זכרו: קודם x ואחר כך y.</p><div class="input-area"><div class="ordered-pair"><span class="paren">(</span><label><small>x</small><input id="xField" inputmode="numeric" value="${state.x}"></label><span class="comma">,</span><label><small>y</small><input id="yField" inputmode="numeric" value="${state.y}"></label><span class="paren">)</span></div></div>`;}
 if(state.mode===3){const t=moveTasks[state.task];body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>${t.text}</h2><div class="start-pair"><span>נקודת ההתחלה</span><strong>${pt(t.start)}</strong></div><p>לאיזו נקודה חדשה תגיעו?</p><div class="choices">${t.options.map((o,i)=>`<button data-choice="${i}" class="${state.choice===i?'selected':''}"><span class="radio">${state.choice===i?'●':'○'}</span><bdi>${pt(o)}</bdi></button>`).join('')}</div>`;}
 const help=state.mode<3?`<button class="help-btn ${state.help?'active':''}" id="help"><span>⌁</span>${state.help?'הסתר עזר':'עזר'}</button>`:'';
 const primary=state.feedback?.ok?`<button class="primary next-btn" id="next">${state.mode===3&&state.task===5?'סיום':'לתרגיל הבא'} ←</button>`:`<button class="primary" id="check">בדיקה</button>`;
 body+=feedbackHTML()+`<div class="task-actions ${state.mode===3?'one':''}">${help}${primary}</div><div class="task-dots">${Array.from({length:6},(_,i)=>`<span class="${i===state.task?'on':''} ${i<state.task?'passed':''}"></span>`).join('')}</div>`;
 return body;
}
function updateExplorePointDOM(i){
 const p=state.explorePoints[i];
 const board=$('#board');
 if(!p||!board)return;
 const group=board.querySelector(`[data-point-index="${i}"]`);
 if(group){
  group.querySelectorAll('circle').forEach(c=>{c.setAttribute('cx',sx(p.x));c.setAttribute('cy',sy(p.y));});
  const name=group.querySelector('.point-name');
  if(name){name.setAttribute('x',sx(p.x)+15);name.setAttribute('y',sy(p.y)-14);}
  const value=group.querySelector('.point-value');
  if(value){value.setAttribute('x',sx(p.x)+15);value.setAttribute('y',sy(p.y)+8);value.textContent=pt(p);}
 }
 const guide=board.querySelector(`[data-guide-index="${i}"]`);
 if(guide){
  const v=guide.querySelector('.guide-v'),h=guide.querySelector('.guide-h');
  if(v){v.setAttribute('x1',sx(p.x));v.setAttribute('x2',sx(p.x));v.setAttribute('y1',sy(0));v.setAttribute('y2',sy(p.y));}
  if(h){h.setAttribute('x1',sx(0));h.setAttribute('x2',sx(p.x));h.setAttribute('y1',sy(p.y));h.setAttribute('y2',sy(p.y));}
  const labels=guide.querySelectorAll('.distance-label');
  labels.forEach((g,idx)=>{
   if(idx===0&&p.y>0){g.setAttribute('transform',`translate(${sx(p.x)+9} ${(sy(0)+sy(p.y))/2})`);const t=g.querySelector('text');if(t)t.textContent=`${p.y} יח׳`;}
   else if((idx===1)||(idx===0&&p.y===0)){g.setAttribute('transform',`translate(${(sx(0)+sx(p.x))/2} ${sy(p.y)-10})`);const t=g.querySelector('text');if(t)t.textContent=`${p.x} יח׳`;}
  });
 }
 const row=document.querySelector(`[data-delete-point="${i}"]`)?.closest('.point-row');
 const coord=row?.querySelector('.point-row-head strong');
 if(coord)coord.innerHTML=`${p.name} = <bdi>${pt(p)}</bdi>`;
}
function bindExplore(){
 const board=$('#board');
 if(!board)return;
 let dragIndex=null,dragMoved=false,startPoint=null,suppressClick=false,activePointer=null;
 const onMove=e=>{
  if(state.measureMode||dragIndex===null||e.pointerId!==activePointer)return;
  if(startPoint&&Math.hypot(e.clientX-startPoint.x,e.clientY-startPoint.y)>3)dragMoved=true;
  const p=gridPointFromEvent(e,board);
  const current=state.explorePoints[dragIndex];
  if(current&&(current.x!==p.x||current.y!==p.y)){
   current.x=p.x;current.y=p.y;
   updateExplorePointDOM(dragIndex);
   suppressClick=true;
  }
  e.preventDefault();
 };
 const onUp=e=>{
  if(dragIndex===null||e.pointerId!==activePointer)return;
  if(dragMoved)suppressClick=true;
  dragIndex=null;startPoint=null;activePointer=null;
  document.removeEventListener('pointermove',onMove);
  document.removeEventListener('pointerup',onUp);
  document.removeEventListener('pointercancel',onUp);
  e.preventDefault();
 };
 board.addEventListener('pointerdown',e=>{
  if(state.measureMode)return;
  const group=e.target.closest?.('[data-point-index]');
  if(!group)return;
  dragIndex=Number(group.dataset.pointIndex);
  activePointer=e.pointerId;
  dragMoved=false;
  startPoint={x:e.clientX,y:e.clientY};
  document.addEventListener('pointermove',onMove,{passive:false});
  document.addEventListener('pointerup',onUp,{passive:false});
  document.addEventListener('pointercancel',onUp,{passive:false});
  e.preventDefault();
 });
 board.addEventListener('click',e=>{
  const group=e.target.closest?.('[data-point-index]');
  if(state.measureMode){
   if(!group){
    if(state.measureFirst!==null||state.measureSecond!==null){state.measureFirst=null;state.measureSecond=null;render();}
    return;
   }
   const i=Number(group.dataset.pointIndex);
   if(state.measureFirst===null||state.measureSecond!==null){state.measureFirst=i;state.measureSecond=null;render();return;}
   if(i===state.measureFirst)return;
   if(canMeasure(state.explorePoints[state.measureFirst],state.explorePoints[i])){state.measureSecond=i;render();}
   return;
  }
  if(group)return;
  if(suppressClick){suppressClick=false;return;}
  addExplorePoint(gridPointFromEvent(e,board));
  render();
 });
}
function bind(){
 if(state.mode===0){
  bindExplore();
  document.querySelectorAll('[data-point-help]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.pointHelp);state.explorePoints[i].help=!state.explorePoints[i].help;render();});
  document.querySelectorAll('[data-show-point]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.showPoint);state.explorePoints[i].showPoint=!state.explorePoints[i].showPoint;render();});
  document.querySelectorAll('[data-delete-point]').forEach(b=>b.onclick=()=>{if(state.measureMode)return;state.explorePoints.splice(Number(b.dataset.deletePoint),1);state.explorePoints.forEach((p,i)=>{p.name=pointName(i);p.color=pointColors[i%pointColors.length];});state.measureFirst=null;state.measureSecond=null;render();});
  const measure=$('#measureToggle');if(measure)measure.onclick=()=>{state.measureMode=!state.measureMode;state.measureFirst=null;state.measureSecond=null;render();};
  const clear=$('#clearPoints');if(clear)clear.onclick=()=>{if(state.measureMode)return;state.explorePoints=[];state.measureFirst=null;state.measureSecond=null;render();};
  const start=$('#startPractice');if(start)start.onclick=()=>switchMode(1);
  return;
 }
 const board=$('#board');
 if(board&&state.mode===1&&!state.feedback?.ok)board.onclick=e=>{state.picked=gridPointFromEvent(e,board);state.feedback=null;render();};
 const xf=$('#xField'),yf=$('#yField');
 if(xf)xf.oninput=e=>{state.x=e.target.value;state.feedback=null;};
 if(yf)yf.oninput=e=>{state.y=e.target.value;state.feedback=null;};
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(!state.feedback?.ok){state.choice=Number(b.dataset.choice);state.feedback=null;render();}});
 const h=$('#help');if(h)h.onclick=()=>{state.help=!state.help;render();};
 const c=$('#check');if(c)c.onclick=check;
 const n=$('#next');if(n)n.onclick=next;
}
function renderCompletion(){
 if(!state.finished)return;
 $('#app').classList.add('hidden');$('#completion').classList.remove('hidden');
 $('#completionGrid').innerHTML=modes.slice(1).map(m=>`<article><span>${m.icon}</span><div><strong>${m.title}</strong><small>6 תרגילים הושלמו</small></div><b>✓</b></article>`).join('');
}
function render(){
 if(state.finished){renderCompletion();return;}
 $('#app').classList.remove('hidden');$('#completion').classList.add('hidden');
 renderNav();
 $('#boardWrap').innerHTML=boardSVG();
 $('#canvasNote').textContent=state.mode===0?(state.measureMode?'מצב מדידה • בחרו נקודות על אותו קו אופקי או אנכי':'לחצו ליצירת נקודה • תפסו נקודה קיימת וגררו אותה'):state.mode===1?'לחצו על נקודת חיתוך ברשת כדי לסמן נקודה':'';
 $('#canvasNote').style.display=(state.mode===0||state.mode===1)?'block':'none';
 $('#taskPanel').innerHTML=taskHTML();
 let progress=0;
 if(state.mode>0)progress=((exerciseIndex()*6+state.task+(state.feedback?.ok?1:0))/18)*100;
 $('#progress').style.width=`${Math.max(0,Math.min(100,progress))}%`;
 bind();
}
$('#restart').onclick=restart;$('#restartDone').onclick=restart;render();
