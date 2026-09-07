let teacherQuestions=JSON.parse(localStorage.getItem('teacherQuestions')||'[]');
let currentType='mcq';

const typeNames={mcq:'MCQ',long:'Long Question',fill_blank:'Fill in the Blanks',paragraph:'Paragraph Writing',true_false:'True / False',match:'Match the Following'};
const letters=['A','B','C','D'];

function qval(id){return document.getElementById(id)?.value?.trim()||'';}
function marksFor(type=currentType){return Number(document.querySelector(`.marks[data-for="${type}"]`)?.value||1);}

function renderDynamicFields(){
  const box=document.getElementById('dynamicFields');
  if(currentType==='mcq'){
    box.innerHTML=`<div class="field"><label>Options <em>*</em></label>${letters.map((l,i)=>`<div class="option-row"><span class="option-letter">${l}</span><input id="opt${i}" placeholder="Enter option ${l}"><input type="radio" name="correctRadio" value="${i}" ${i===0?'checked':''} title="Correct answer"></div>`).join('')}</div>`;
  }else if(currentType==='true_false'){
    box.innerHTML=`<div class="field"><label>Answer</label><div class="tf-choice"><label><input type="radio" name="tf" value="সত্য" checked> সত্য</label><label><input type="radio" name="tf" value="মিথ্যা"> মিথ্যা</label></div></div>`;
  }else if(currentType==='match'){
    box.innerHTML=`<div class="field"><label>Matching Items</label><div class="match-grid">${[1,2,3,4].map(i=>`<input id="left${i}" placeholder="Left ${i}"><input id="right${i}" placeholder="Right ${i}">`).join('')}</div></div>`;
  }else{
    box.innerHTML=`<div class="info-banner">এই ধরনের প্রশ্নের জন্য Question এবং Correct Answer/Model Answer লিখলেই হবে।</div>`;
  }
  updateCorrectAnswerOptions();
  updateMiniPreview();
}

function getAnswer(){
  if(currentType==='mcq'){
    const i=Number(document.querySelector('input[name="correctRadio"]:checked')?.value||0);
    return qval('opt'+i);
  }
  if(currentType==='true_false') return document.querySelector('input[name="tf"]:checked')?.value||'';
  if(currentType==='match'){
    const pairs=[]; for(let i=1;i<=4;i++){const l=qval('left'+i),r=qval('right'+i);if(l||r)pairs.push(`${l} — ${r}`);}
    return pairs.join(' | ');
  }
  return qval('correctAnswerText');
}

function updateCorrectAnswerOptions(){
  const sel=document.getElementById('correctAnswer');
  if(!sel)return;
  if(currentType==='mcq'){
    sel.innerHTML=letters.map((l,i)=>`<option value="${i}">${l}</option>`).join('');
    sel.onchange=()=>{const r=document.querySelector(`input[name="correctRadio"][value="${sel.value}"]`);if(r)r.checked=true;updateMiniPreview();};
  }else{
    sel.innerHTML=`<option value="">Select / write the answer below</option>`;
    const field=document.createElement('div');
    field.className='field';
    field.innerHTML=`<input id="correctAnswerText" placeholder="Correct / Model Answer">`;
    sel.parentElement.after(field);
  }
}

function collectQuestion(){
  const question=qval('question');
  if(!question){alert('প্রথমে প্রশ্ন লিখুন।');document.getElementById('question').focus();return null;}
  let answer=getAnswer();
  if(currentType==='mcq'){
    const opts=letters.map((_,i)=>qval('opt'+i));
    if(opts.some(x=>!x)){alert('MCQ-এর সব ৪টি option পূরণ করুন।');return null;}
    answer=opts[Number(document.querySelector('input[name="correctRadio"]:checked')?.value||0)];
  }else if(!answer){
    alert('Correct / Model Answer দিন।');return null;
  }
  const q={type:currentType,question,answer,marks:marksFor(),subject:document.getElementById('subject').value,class_name:document.getElementById('classSemester').value,solution:{enabled:Boolean(qval('explanation')),steps:qval('explanation')?[qval('explanation')]:[]}};
  if(currentType==='mcq')q.options=letters.map((_,i)=>qval('opt'+i));
  if(currentType==='true_false')q.options=['সত্য','মিথ্যা'];
  if(currentType==='match'){
    q.pairs=[]; for(let i=1;i<=4;i++){const l=qval('left'+i),r=qval('right'+i);if(l||r)q.pairs.push({left:l,right:r});}
  }
  return q;
}

function saveDraft(){
  const q=collectQuestion(); if(!q)return;
  teacherQuestions.push(q);
  localStorage.setItem('teacherQuestions',JSON.stringify(teacherQuestions));
  localStorage.setItem('teacherDraftMeta',JSON.stringify({subject:q.subject,className:q.class_name}));
  location.href='teacher-preview.html';
}

function resetQuestion(){
  document.getElementById('question').value='';
  document.getElementById('explanation').value='';
  renderDynamicFields();
  document.getElementById('questionCount').textContent='0 / 1000';
  document.getElementById('explanationCount').textContent='0 / 1000';
}

function updateMiniPreview(){
  document.getElementById('summaryType').textContent=typeNames[currentType];
  document.getElementById('summaryMarks').textContent=marksFor();
  document.getElementById('summarySubject').textContent=document.getElementById('subject').value;
  document.getElementById('summaryClass').textContent=document.getElementById('classSemester').value;
  document.getElementById('miniQuestion').textContent=(qval('question')||'1) প্রশ্নটি এখানে দেখা যাবে।');
  const opts=document.getElementById('miniOptions');
  if(currentType==='mcq')opts.innerHTML=letters.map((l,i)=>`<div class="${document.querySelector('input[name="correctRadio"]:checked')?.value==i?'correct-mini':''}">${l}) ${qval('opt'+i)||'Option '+l}</div>`).join('');
  else if(currentType==='true_false')opts.innerHTML='<div>○ সত্য</div><div>○ মিথ্যা</div>';
  else if(currentType==='match')opts.innerHTML=[1,2,3,4].map(i=>qval('left'+i)||qval('right'+i)?`<div>${qval('left'+i)} — ${qval('right'+i)}</div>`:'').join('');
  else opts.innerHTML='<div class="muted">Model answer will be used after the question.</div>';
}

document.querySelectorAll('.type-card').forEach(btn=>btn.addEventListener('click',()=>{
  currentType=btn.dataset.type;
  document.querySelectorAll('.type-card').forEach(x=>x.classList.toggle('active',x===btn));
  renderDynamicFields();
}));
document.querySelectorAll('.marks').forEach(s=>s.addEventListener('change',updateMiniPreview));
document.getElementById('subject').addEventListener('change',updateMiniPreview);
document.getElementById('classSemester').addEventListener('change',updateMiniPreview);
document.getElementById('question').addEventListener('input',e=>{document.getElementById('questionCount').textContent=`${e.target.value.length} / 1000`;updateMiniPreview();});
document.getElementById('explanation').addEventListener('input',e=>document.getElementById('explanationCount').textContent=`${e.target.value.length} / 1000`);
document.getElementById('saveQuestion').addEventListener('click',saveDraft);
document.getElementById('saveQuestionBottom').addEventListener('click',saveDraft);
document.getElementById('resetQuestion').addEventListener('click',resetQuestion);
document.addEventListener('input',updateMiniPreview);
renderDynamicFields();
