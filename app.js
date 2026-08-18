const modes=[
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
let state={mode:0,task:0,picked:null,x:'',y:'',choice:null,help:false,feedback:null,done:[false,false,false],finished:false};
const GRID=10,SIZE=620,PAD=52,STEP=(SIZE-PAD*2)/GRID,sx=x=>PAD+x*STEP,sy=y=>SIZE-PAD-y*STEP,pt=p=>`(${p.x}, ${p.y})`;
const $=s=>document.querySelector(s);
function resetExercise(){state.picked=null;state.x='';state.y='';state.choice=null;state.help=false;state.feedback=null;}
function restart(){state={mode:0,task:0,picked:null,x:'',y:'',choice:null,help:false,feedback:null,done:[false,false,false],finished:false};render();}
function switchMode(i){state.mode=i;state.task=0;state.finished=false;resetExercise();render();}
function destination(){const t=moveTasks[state.task];return{x:t.start.x+t.dx,y:t.start.y+t.dy};}
function same(a,b){return a&&b&&a.x===b.x&&a.y===b.y;}
function check(){
 if(state.mode===0){const t=placeTasks[state.task]; if(!state.picked) state.feedback={ok:false,text:'סמנו קודם נקודה על מערכת הצירים.'}; else if(same(state.picked,t)) state.feedback={ok:true,text:`מצוין! סימנתם נכון את הנקודה ${pt(t)}.`}; else state.feedback={ok:false,text:'עדיין לא. אפשר להזיז את הסימון ולבדוק שוב.'};}
 else if(state.mode===1){const t=readTasks[state.task]; if(state.x.trim()===''||state.y.trim()==='') state.feedback={ok:false,text:'כתבו גם את שיעור x וגם את שיעור y.'}; else if(Number(state.x)===t.x&&Number(state.y)===t.y) state.feedback={ok:true,text:`נכון! הנקודה היא ${pt(t)}.`}; else if(Number(state.x)===t.y&&Number(state.y)===t.x) state.feedback={ok:false,text:'נראה שהחלפתם בין x ל־y. זכרו: x נכתב ראשון.'}; else state.feedback={ok:false,text:'עדיין לא. בדקו את המיקום ביחס לציר x ולציר y ונסו שוב.'};}
 else {if(state.choice===null) state.feedback={ok:false,text:'בחרו קודם אחת מהתשובות.'}; else if(same(moveTasks[state.task].options[state.choice],destination())) state.feedback={ok:true,text:`נכון! הנקודה החדשה היא ${pt(destination())}.`}; else state.feedback={ok:false,text:'לא הפעם. חשבו איזה שיעור משתנה ובכמה יחידות, ואז נסו שוב.'};}
 render();
}
function next(){if(!state.feedback?.ok)return;if(state.task<5){state.task++;resetExercise();render();return;}state.done[state.mode]=true;if(state.mode<2){state.mode++;state.task=0;resetExercise();render();}else{state.finished=true;render();}}
function boardSVG(){
 const interactive=state.mode===0&&!state.feedback?.ok;
 let fixed=[],selected=null,guide=null,dest=null,line=null;
 if(state.mode===0){selected=state.picked;guide=state.help?state.picked:null;}
 if(state.mode===1){fixed=[readTasks[state.task]];guide=state.help?readTasks[state.task]:null;}
 if(state.mode===2){fixed=[moveTasks[state.task].start];if(state.feedback?.ok){dest=destination();line={from:moveTasks[state.task].start,to:dest};}}
 let g='';for(let i=0;i<=GRID;i++){g+=`<line x1="${sx(i)}" y1="${sy(0)}" x2="${sx(i)}" y2="${sy(10)}" class="grid-line"/><line x1="${sx(0)}" y1="${sy(i)}" x2="${sx(10)}" y2="${sy(i)}" class="grid-line"/>`;}
 let ticks='';for(let i=0;i<=GRID;i++){ticks+=`<text x="${sx(i)}" y="${sy(0)+27}" text-anchor="middle">${i}</text>`;if(i>0)ticks+=`<text x="${sx(0)-20}" y="${sy(i)+5}" text-anchor="middle">${i}</text>`;}
 let guideHtml=guide?`<g class="guides"><line x1="${sx(guide.x)}" y1="${sy(0)}" x2="${sx(guide.x)}" y2="${sy(guide.y)}"/><line x1="${sx(0)}" y1="${sy(guide.y)}" x2="${sx(guide.x)}" y2="${sy(guide.y)}"/></g>`:'';
 let fixedHtml=fixed.map(p=>`<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="9" class="point fixed-point"/>`).join('');
 let selHtml=selected?`<circle cx="${sx(selected.x)}" cy="${sy(selected.y)}" r="11" class="point selected-point"/><circle cx="${sx(selected.x)}" cy="${sy(selected.y)}" r="17" class="selection-ring"/>`:'';
 let moveHtml=line?`<line x1="${sx(line.from.x)}" y1="${sy(line.from.y)}" x2="${sx(line.to.x)}" y2="${sy(line.to.y)}" class="move-line" marker-end="url(#moveArrow)"/>`:'';
 let destHtml=dest?`<circle cx="${sx(dest.x)}" cy="${sy(dest.y)}" r="10" class="destination-point"/>`:'';
 return `<svg viewBox="0 0 ${SIZE} ${SIZE}" class="board ${interactive?'interactive':''}" id="board" role="img" aria-label="מערכת צירים ברביע הראשון"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#18353d"/></marker><marker id="moveArrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e19b21"/></marker></defs><rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="20" fill="#fff"/>${g}<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(10)+20}" y2="${sy(0)}" class="axis" marker-end="url(#arrow)"/><line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0)}" y2="${sy(10)-20}" class="axis" marker-end="url(#arrow)"/><g class="ticks">${ticks}</g><text x="${sx(10)+26}" y="${sy(0)+28}" class="axis-name">x</text><text x="${sx(0)-22}" y="${sy(10)-23}" class="axis-name">y</text>${guideHtml}${moveHtml}${fixedHtml}${selHtml}${destHtml}</svg>`;
}
function renderNav(){ $('#modeNav').innerHTML=modes.map((m,i)=>`<button data-mode="${i}" class="${state.mode===i?'active':''} ${state.done[i]?'done':''}"><span class="lesson-icon">${state.done[i]?'✓':m.icon}</span><span><strong>${m.title}</strong><small>${m.short}</small></span></button>`).join(''); document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(Number(b.dataset.mode)));}
function feedbackHTML(){if(!state.feedback)return'';return`<div class="feedback-card ${state.feedback.ok?'success':'error'}"><strong>${state.feedback.ok?'נכון!':'נסו שוב'}</strong><span>${state.feedback.text}</span></div>`;}
function taskHTML(){let body='';if(state.mode===0){const t=placeTasks[state.task];body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>סמנו את הנקודה</h2><div class="target-pair">${pt(t)}</div><p>לחצו במקום המתאים על מערכת הצירים. רק לאחר מכן לחצו על „בדיקה”.</p>`;}
 if(state.mode===1){body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>מהם שיעורי הנקודה?</h2><p>קראו את מיקום הנקודה וכתבו את הזוג הסדור. זכרו: קודם x ואחר כך y.</p><div class="input-area"><div class="ordered-pair"><span class="paren">(</span><label><small>x</small><input id="xField" inputmode="numeric" value="${state.x}"></label><span class="comma">,</span><label><small>y</small><input id="yField" inputmode="numeric" value="${state.y}"></label><span class="paren">)</span></div></div>`;}
 if(state.mode===2){const t=moveTasks[state.task];body=`<div class="task-kicker">תרגיל ${state.task+1} מתוך 6</div><h2>${t.text}</h2><div class="start-pair"><span>נקודת ההתחלה</span><strong>${pt(t.start)}</strong></div><p>לאיזו נקודה חדשה תגיעו?</p><div class="choices">${t.options.map((o,i)=>`<button data-choice="${i}" class="${state.choice===i?'selected':''}"><span class="radio">${state.choice===i?'●':'○'}</span><bdi>${pt(o)}</bdi></button>`).join('')}</div>`;}
 const help=state.mode<2?`<button class="help-btn ${state.help?'active':''}" id="help"><span>⌁</span>${state.help?'הסתר עזר':'עזר'}</button>`:'';const primary=state.feedback?.ok?`<button class="primary next-btn" id="next">${state.mode===2&&state.task===5?'סיום':'לתרגיל הבא'} ←</button>`:`<button class="primary" id="check">בדיקה</button>`;body+=feedbackHTML()+`<div class="task-actions ${state.mode===2?'one':''}">${help}${primary}</div><div class="task-dots">${Array.from({length:6},(_,i)=>`<span class="${i===state.task?'on':''} ${i<state.task?'passed':''}"></span>`).join('')}</div>`;return body;}
function bind(){const board=$('#board');if(board&&state.mode===0&&!state.feedback?.ok)board.onclick=e=>{const r=board.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*SIZE,py=(e.clientY-r.top)/r.height*SIZE;state.picked={x:Math.max(0,Math.min(10,Math.round((px-PAD)/STEP))),y:Math.max(0,Math.min(10,Math.round((SIZE-PAD-py)/STEP)))};state.feedback=null;render();};const xf=$('#xField'),yf=$('#yField');if(xf)xf.oninput=e=>{state.x=e.target.value;state.feedback=null;};if(yf)yf.oninput=e=>{state.y=e.target.value;state.feedback=null;};document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(!state.feedback?.ok){state.choice=Number(b.dataset.choice);state.feedback=null;render();}});const h=$('#help');if(h)h.onclick=()=>{state.help=!state.help;render();};const c=$('#check');if(c)c.onclick=check;const n=$('#next');if(n)n.onclick=next;}
function renderCompletion(){if(!state.finished)return;$('#app').classList.add('hidden');$('#completion').classList.remove('hidden');$('#completionGrid').innerHTML=modes.map(m=>`<article><span>${m.icon}</span><div><strong>${m.title}</strong><small>6 תרגילים הושלמו</small></div><b>✓</b></article>`).join('');}
function render(){if(state.finished){renderCompletion();return;}$('#app').classList.remove('hidden');$('#completion').classList.add('hidden');renderNav();$('#boardWrap').innerHTML=boardSVG();$('#canvasNote').style.display=state.mode===0?'block':'none';$('#taskPanel').innerHTML=taskHTML();$('#progress').style.width=`${((state.mode*6+state.task+(state.feedback?.ok?1:0))/18)*100}%`;bind();}
$('#restart').onclick=restart;$('#restartDone').onclick=restart;render();
