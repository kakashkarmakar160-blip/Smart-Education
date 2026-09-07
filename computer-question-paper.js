const MAX=20;
const BANK_KEY='computerQuestionBanksV2';
const SEMESTERS=['1','2','3','4'];
const LOWER_SUBJECTS=[['bangla','বাংলা'],['english','ইংরেজি'],['physics','Physics'],['life-science','Life Science'],['mathematics','গণিত'],['geography','ভূগোল'],['history','ইতিহাস']];
const HIGHER_SUBJECTS=[...LOWER_SUBJECTS,['accountancy','Accountancy'],['commercial-law','Commercial Law'],['business-studies','Business Studies'],['computer-science','Computer Science'],['costing','Costing']];
let activeClass=Number(params().get('class')||JSON.parse(localStorage.getItem('computerProfile')||'{}').className?.match(/\d+/)?.[0]||12);
let activeSemester=String(params().get('semester')||JSON.parse(localStorage.getItem('computerProfile')||'{}').semester||'1').match(/[1-4]/)?.[0]||'1';
let activeSubject=params().get('subject')||'bangla',editingIndex=null,bank={};
if(![5,6,7,8,9,10,11,12].includes(activeClass))activeClass=12;
if(sessionStorage.getItem('computerEditorUnlocked')!=='1')location.href='computer-room.html';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function readBanks(){try{return JSON.parse(localStorage.getItem(BANK_KEY)||'{}')}catch{return {}}}
function key(){return `class${activeClass}|semester${activeSemester}|${activeSubject}`}
function subjects(){return activeClass<=10?LOWER_SUBJECTS:HIGHER_SUBJECTS}
function defaultQuestions(){
 const base=[
  {type:'mcq',question:'কম্পিউটারের মস্তিষ্ক বলা হয় কোন অংশকে?',options:['CPU','Monitor','Keyboard','Mouse'],answer:'CPU',marks:1},
  {type:'mcq',question:'কোনটি Input Device?',options:['Monitor','Printer','Keyboard','Speaker'],answer:'Keyboard',marks:1},
  {type:'mcq',question:'কোনটি Output Device?',options:['Mouse','Keyboard','Monitor','Scanner'],answer:'Monitor',marks:1},
  {type:'mcq',question:'CPU-এর পূর্ণরূপ কী?',options:['Central Processing Unit','Computer Personal Unit','Central Program Utility','Control Processing User'],answer:'Central Processing Unit',marks:1},
  {type:'mcq',question:'কীবোর্ডে Enter key সাধারণত কী কাজে ব্যবহৃত হয়?',options:['নতুন লাইন/নির্দেশ নিশ্চিত করতে','কম্পিউটার বন্ধ করতে','শব্দ কমাতে','ছবি তুলতে'],answer:'নতুন লাইন/নির্দেশ নিশ্চিত করতে',marks:1}
 ];
 let old=[];try{old=JSON.parse(localStorage.getItem('computerQuestionBanks')||'{}')}catch{}
 return old[activeSubject]?.length?old[activeSubject].slice(0,MAX):base;
}
function seed(){
 bank=readBanks();
 const k=key();
 if(!Array.isArray(bank[k])||!bank[k].length)bank[k]=defaultQuestions().map(q=>({...q,options:q.options?[...q.options]:undefined}));
 const base=bank[k].slice();
 while(bank[k].length<MAX&&bank[k].length){const src=base[bank[k].length%base.length];bank[k].push({...src,question:`${src.question} (প্রশ্ন ${bank[k].length+1})`})}
 bank[k]=bank[k].slice(0,MAX);
 localStorage.setItem(BANK_KEY,JSON.stringify(bank));
}
function renderTabs(){
 document.getElementById('subjectTabs').innerHTML=subjects().map(([id,name])=>`<button class="subject-tab ${id===activeSubject?'active':''}" data-subject="${id}"><strong>${name}</strong><span>${(bank[`class${activeClass}|semester${activeSemester}|${id}`]||[]).length} / ${MAX} Questions</span></button>`).join('');
 document.querySelectorAll('.subject-tab').forEach(b=>b.onclick=()=>{activeSubject=b.dataset.subject;editingIndex=null;seed();render()});
}
function render(){
 document.getElementById('editorClass').value=String(activeClass);document.getElementById('editorSemester').value=activeSemester;
 const list=subjects();if(!list.some(x=>x[0]===activeSubject))activeSubject=list[0][0];
 renderTabs();const name=list.find(x=>x[0]===activeSubject)?.[1]||activeSubject,qs=(bank[key()]||[]).slice(0,MAX);
 document.getElementById('subjectTitle').textContent=`Class ${activeClass} • Semester ${activeSemester} • ${name}`;
 document.getElementById('questionCount').textContent=`${qs.length} / ${MAX} Questions`;
 document.getElementById('questionList').innerHTML=qs.map((q,i)=>`<article class="computer-q-row"><span class="q-num">${i+1}</span><div class="q-preview" title="${esc(q.question)}">${esc(q.question)}</div><span class="q-type">${typeName(q.type)}</span><span class="q-mark">${Number(q.marks||1)} Mark</span><button class="mini-icon edit" data-edit="${i}" title="Edit">✎</button><button class="mini-icon delete" data-delete="${i}" title="Delete">🗑</button></article>`).join('');
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.edit)));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>removeQuestion(Number(b.dataset.delete)));
}
function typeName(t){return({mcq:'MCQ',short:'Short Answer',true_false:'True / False',fill_blank:'Fill in the Blank',paragraph:'Paragraph',essay:'Essay'})[t]||'Question'}
function openEditor(i){editingIndex=i;const q=bank[key()][i]||{type:'mcq',marks:1,question:'',options:['','','',''],answer:''};document.getElementById('modalEyebrow').textContent=`QUESTION ${i+1}`;document.getElementById('modalTitle').textContent='Edit Question';document.getElementById('qType').value=q.type||'mcq';document.getElementById('qMarks').value=q.marks||1;document.getElementById('qText').value=q.question||'';document.getElementById('editorError').textContent='';renderExtra(q);document.getElementById('editorModal').classList.remove('hidden')}
function addQuestion(){if((bank[key()]||[]).length>=MAX){alert('একটি Class + Semester + Subject-এ সর্বোচ্চ ২০টি প্রশ্ন রাখা যাবে।');return}editingIndex=bank[key()].length;bank[key()].push({type:'mcq',question:'',options:['','','',''],answer:'',marks:1});openEditor(editingIndex)}
function renderExtra(q={}){const type=document.getElementById('qType').value,box=document.getElementById('qExtra');if(type==='mcq'){const opts=q.options||['','','',''];box.innerHTML=`<div class="option-editor">${[0,1,2,3].map(i=>`<div class="option-line"><b>${String.fromCharCode(65+i)})</b><input id="opt${i}" value="${esc(opts[i]||'')}" placeholder="Option ${String.fromCharCode(65+i)}"></div>`).join('')}</div><div class="answer-row"><select id="qAnswer"><option value="">Correct option</option>${[0,1,2,3].map(i=>`<option value="${i}" ${(opts[i]||'')===q.answer?'selected':''}>${String.fromCharCode(65+i)}) ${esc(opts[i]||'Option '+String.fromCharCode(65+i))}</option>`).join('')}</select><input id="qExplanation" value="${esc(q.explanation||'')}" placeholder="Explanation (optional)"></div>`}else if(type==='true_false'){box.innerHTML=`<div class="answer-row"><select id="qAnswer"><option value="সত্য" ${q.answer==='সত্য'?'selected':''}>সত্য</option><option value="মিথ্যা" ${q.answer==='মিথ্যা'?'selected':''}>মিথ্যা</option></select><input id="qExplanation" value="${esc(q.explanation||'')}" placeholder="Explanation (optional)"></div>`}else box.innerHTML=`<div class="answer-row"><input id="qAnswer" value="${esc(q.answer||'')}" placeholder="Correct / Model Answer"><input id="qExplanation" value="${esc(q.explanation||'')}" placeholder="Explanation (optional)"></div>`}
function saveEditor(){const err=document.getElementById('editorError'),text=document.getElementById('qText').value.trim(),type=document.getElementById('qType').value,marks=Math.max(1,Math.min(20,Number(document.getElementById('qMarks').value)||1));if(!text){err.textContent='Question লিখুন।';return}let q={type,question:text,marks};if(type==='mcq'){q.options=[0,1,2,3].map(i=>document.getElementById('opt'+i).value.trim());if(q.options.some(x=>!x)){err.textContent='MCQ-এর চারটি option পূরণ করুন।';return}const ai=Number(document.getElementById('qAnswer').value);if(!Number.isInteger(ai)){err.textContent='Correct option নির্বাচন করুন।';return}q.answer=q.options[ai]}else{q.answer=document.getElementById('qAnswer').value.trim();if(!q.answer){err.textContent='Correct / Model Answer লিখুন।';return}}q.explanation=document.getElementById('qExplanation')?.value.trim()||'';bank[key()][editingIndex]=q;localStorage.setItem(BANK_KEY,JSON.stringify(bank));closeEditor();render();document.getElementById('saveMsg').textContent='✓ Question saved.'}
function removeQuestion(i){if(!confirm(`Question ${i+1} delete করবেন?`))return;bank[key()].splice(i,1);localStorage.setItem(BANK_KEY,JSON.stringify(bank));render()}
function closeEditor(){document.getElementById('editorModal').classList.add('hidden')}
document.getElementById('editorClass').onchange=e=>{activeClass=Number(e.target.value);activeSubject=subjects()[0][0];seed();render()};
document.getElementById('editorSemester').onchange=e=>{activeSemester=e.target.value;seed();render()};
document.getElementById('addQuestion').onclick=addQuestion;document.getElementById('saveEditor').onclick=saveEditor;document.getElementById('cancelEditor').onclick=closeEditor;document.getElementById('closeEditor').onclick=closeEditor;document.getElementById('qType').onchange=()=>renderExtra({});document.getElementById('savePaper').onclick=()=>{localStorage.setItem(BANK_KEY,JSON.stringify(bank));document.getElementById('saveMsg').textContent=`✓ Class ${activeClass}, Semester ${activeSemester} question paper saved.`};
seed();render();
