const wanted=new URLSearchParams(location.search).get('resultId');
const results=JSON.parse(localStorage.getItem('teacherResults')||'[]');
const r=results.find(x=>x.id===wanted);
const head=document.getElementById('resultHead'),list=document.getElementById('answerList');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
if(!r){head.innerHTML='<div><p class="eyebrow">RESULT PREVIEW</p><h1>Result পাওয়া যায়নি</h1></div>';list.innerHTML='<div class="card">এই result-এর data পাওয়া যায়নি।</div>';}else{
 const name=esc(r.student?.name||r.studentName||'Student');
 head.innerHTML=`<div><p class="eyebrow">STUDENT ANSWER REVIEW</p><h1>${name}</h1><p class="muted">${esc(r.title||'Question Paper')} • ${esc(r.subject||'')} • ${r.obtained||0}/${r.totalMarks||0} • ${r.percentage||0}%</p></div><div class="preview-actions"><a class="outline" href="teacher-profile.html">Back to Profile</a><a class="primary" href="teacher-marksheet-edit.html?resultId=${encodeURIComponent(r.id)}">Edit Marks</a></div>`;
 const qs=r.questions||[]; const ans=r.answers||{}; const awarded=Array.isArray(r.awardedMarks)?r.awardedMarks:qs.map((q,i)=>ans[i]?.correct?Number(q.marks||1):0);
 list.innerHTML=qs.map((q,i)=>{
   const a=ans[i]; let studentAnswer=a?.value||'Not Answered';
   if(q.type==='mcq' && a?.chosen!==undefined) studentAnswer=q.options?.[a.chosen]??studentAnswer;
   const status=a?(a.correct?'correct':'wrong'):'unattempted';
   const label=status==='correct'?'Correct':status==='wrong'?'Wrong':'Not Answered';
   let options='';
   if(q.type==='mcq') options=`<div class="review-options">${(q.options||[]).map((o,j)=>{let cls='';if(j===a?.chosen)cls=a.correct?'picked-correct':'picked-wrong';if(o===q.answer)cls+=' model-correct';return `<div class="review-option ${cls}">${String.fromCharCode(65+j)}) ${esc(o)}</div>`}).join('')}</div>`;
   else if(q.type==='true_false') options=`<div class="review-options"><div class="review-option ${a?.value==='সত্য'?(a.correct?'picked-correct':'picked-wrong'):''}">সত্য</div><div class="review-option ${a?.value==='মিথ্যা'?(a.correct?'picked-correct':'picked-wrong'):''}">মিথ্যা</div></div>`;
   return `<article class="student-answer-card ${status}"><div class="answer-card-head"><h3>${i+1}. ${esc(q.question)}</h3><span class="status-badge ${status}">${label}</span></div>${options}<div class="answer-summary"><div><small>Student Answer</small><b>${esc(studentAnswer)}</b></div><div><small>Correct / Model Answer</small><b>${esc(q.answer||'—')}</b></div><div><small>Marks</small><b>${Number(awarded[i]||0)}/${Number(q.marks||1)}</b></div></div></article>`;
 }).join('');
}