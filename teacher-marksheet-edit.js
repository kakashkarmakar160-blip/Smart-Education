const wanted=new URLSearchParams(location.search).get('resultId');
const results=JSON.parse(localStorage.getItem('teacherResults')||'[]');
const area=document.getElementById('editArea');
const r=results.find(x=>x.id===wanted);

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const typeNames={mcq:'MCQ',long:'Long Question',fill_blank:'Fill in the Blanks',paragraph:'Paragraph Writing',true_false:'True / False',match:'Match the Following'};
const letters=['A','B','C','D'];

if(!r){
  area.innerHTML='<div class="empty-history"><h3>Result পাওয়া যায়নি</h3><a class="primary" href="teacher-profile.html">Teacher Profile</a></div>';
}else{
  const qs=r.questions||[];
  const ans=r.answers||{};
  const awarded=Array.isArray(r.awardedMarks)?r.awardedMarks:qs.map((q,i)=>ans[i]?.correct?Number(q.marks||1):0);
  const maxMarks=qs.map(q=>Number(q.marks||1));

  area.innerHTML=`
    <div class="edit-result-card">
      <div class="result-student-head">
        <div>
          <p class="eyebrow">EDIT STUDENT RESULT</p>
          <h2>${esc(r.student?.name||r.studentName||'Student')}</h2>
          <p class="muted">${esc(r.student?.id||'')} • ${esc(r.title||'Question Paper')}</p>
        </div>
        <a class="outline" href="teacher-student-result.html?resultId=${encodeURIComponent(r.id)}">Preview Answers</a>
      </div>

      <div class="teacher-edit-summary">
        <div><span>Total Questions</span><b>${qs.length}</b></div>
        <div><span>Total Marks</span><b id="totalMarksView">0</b></div>
        <div><span>Obtained Marks</span><b id="obtainedMarksView">0</b></div>
        <div><span>Percentage</span><b id="percentageView">0%</b></div>
      </div>

      <div class="teacher-edit-head">
        <div><p class="eyebrow">QUESTION REVIEW</p><h3>Student Answers & Marks</h3></div>
        <span class="muted">প্রত্যেক প্রশ্নের Marks Edit করা যাবে</span>
      </div>
      <div id="questionEditList" class="question-edit-list"></div>
      <div class="edit-save-row">
        <button id="saveResult" class="primary">Save All Marks</button>
        <a class="outline" href="teacher-profile.html">Back to Teacher Profile</a>
        <p id="saveMsg" class="success-text"></p>
      </div>
    </div>`;

  const qList=document.getElementById('questionEditList');
  qList.innerHTML=qs.map((q,i)=>{
    const a=ans[i];
    const max=Number(q.marks||1);
    const current=Math.min(Math.max(Number(awarded[i]??0)||0,0),max);
    const status=!a?'unattempted':a.correct?'correct':'wrong';
    let studentAnswer=a?.value||'Not Answered';
    if(q.type==='mcq'&&a?.chosen!==undefined) studentAnswer=q.options?.[a.chosen]??studentAnswer;
    let options='';
    if(q.type==='mcq') options=`<div class="teacher-review-options">${(q.options||[]).map((o,j)=>{let cls='';if(j===a?.chosen)cls=a.correct?'picked-correct':'picked-wrong';if(o===q.answer)cls+=' model-correct';return `<span class="teacher-review-option ${cls}">${letters[j]||''}) ${esc(o)}</span>`}).join('')}</div>`;
    else if(q.type==='true_false') options=`<div class="teacher-review-options"><span class="teacher-review-option ${a?.value==='সত্য'?(a.correct?'picked-correct':'picked-wrong'):''}">সত্য</span><span class="teacher-review-option ${a?.value==='মিথ্যা'?(a.correct?'picked-correct':'picked-wrong'):''}">মিথ্যা</span></div>`;
    return `<article class="question-edit-card ${status}" data-index="${i}">
      <div class="question-edit-main">
        <div class="question-edit-title"><span class="q-index">${i+1}</span><span class="q-type">${esc(typeNames[q.type]||q.type)}</span><h4>${esc(q.question)}</h4></div>
        ${options}
        <div class="teacher-answer-lines"><div><small>Your Answer</small><b>${esc(studentAnswer)}</b></div><div><small>Correct / Model Answer</small><b>${esc(q.answer||'—')}</b></div></div>
      </div>
      <div class="question-mark-control">
        <button type="button" class="question-edit-toggle" data-edit="${i}">Edit</button>
        <label>Marks</label>
        <div class="mark-editor"><input class="question-mark-input" data-mark="${i}" type="number" min="0" max="${max}" step="0.5" value="${current}" disabled><span>/ ${max}</span></div>
        <strong class="question-status ${status}">${status==='correct'?'✓ Correct':status==='wrong'?'✕ Wrong':'— Not Answered'}</strong>
      </div>
    </article>`;
  }).join('');

  qList.querySelectorAll('.question-edit-toggle').forEach(btn=>btn.addEventListener('click',()=>{
    const i=Number(btn.dataset.edit),input=qList.querySelector(`[data-mark="${i}"]`);
    if(!input)return;
    input.disabled=false;input.focus();input.select();btn.textContent='Editing';btn.classList.add('editing');
  }));

  qList.querySelectorAll('.question-mark-input').forEach(input=>input.addEventListener('input',updateSummary));
  updateSummary();
  document.getElementById('saveResult').onclick=save;

  function getMarks(){return qs.map((q,i)=>{const max=Number(q.marks||1);const raw=Number(qList.querySelector(`[data-mark="${i}"]`)?.value);return Math.min(Math.max(Number.isFinite(raw)?raw:0,0),max);});}
  function updateSummary(){
    const marks=getMarks(),total=qs.reduce((s,q)=>s+Number(q.marks||1),0),obt=marks.reduce((s,m)=>s+m,0),pct=total?Math.round(obt/total*100):0;
    document.getElementById('totalMarksView').textContent=total;
    document.getElementById('obtainedMarksView').textContent=Number.isInteger(obt)?obt:obt.toFixed(1);
    document.getElementById('percentageView').textContent=pct+'%';
  }
  function save(){
    const idx=results.findIndex(x=>x.id===wanted);if(idx<0)return;
    const rr=results[idx],qs2=rr.questions||[],marks=getMarks();
    const total=qs2.reduce((s,q)=>s+Number(q.marks||1),0),obt=marks.reduce((s,m)=>s+m,0),pct=total?Math.round(obt/total*100):0;
    rr.awardedMarks=marks;rr.obtained=obt;rr.totalMarks=total;rr.percentage=pct;
    rr.grade=pct>=90?'A+':pct>=80?'A':pct>=70?'B':pct>=60?'C':pct>=40?'D':'F';
    localStorage.setItem('teacherResults',JSON.stringify(results));
    const sr=JSON.parse(localStorage.getItem('studentResults')||'[]');
    const si=sr.findIndex(x=>x.id===wanted);
    if(si>=0){sr[si]={...sr[si],awardedMarks:marks,obtained:obt,totalMarks:total,percentage:pct,grade:rr.grade};localStorage.setItem('studentResults',JSON.stringify(sr));}
    document.getElementById('saveMsg').textContent='✓ Result saved successfully.';
    updateSummary();
  }
}
