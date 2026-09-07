let examData=null,file='';let selected={};
async function initExam(){
 file=params().get('file');examData=await loadJSON(file);
 document.getElementById('examTitle').textContent='Practice';
 document.getElementById('practiceHeading').textContent=examData.title;
 document.getElementById('examMeta').innerHTML=`<b>${escapeHtml(examData.class_name)} • ${escapeHtml(examData.subject_name)}</b><br>${escapeHtml(examData.school_name)} • ${examData.questions.length} Questions`;
 document.getElementById('progressPill').textContent=`0 / ${examData.questions.length}`;
 document.getElementById('questionList').innerHTML=examData.questions.map((q,i)=>renderQuestion(q,i)).join('');
 document.querySelectorAll('.solution-btn').forEach(b=>b.addEventListener('click',()=>showSolution(Number(b.dataset.i))));
 document.querySelectorAll('.mcq-option').forEach(b=>b.addEventListener('click',()=>answerMCQ(Number(b.dataset.i),Number(b.dataset.j))));
 document.querySelectorAll('.tf-option').forEach(b=>b.addEventListener('click',()=>answerTF(Number(b.dataset.i),b.dataset.value)));
 document.getElementById('submitBtn').addEventListener('click',submitPractice);
}
function renderQuestion(q,i){
 const sol=q.solution?.enabled?`<button class="solution-btn" data-i="${i}">💡 Solution</button>`:'';
 let body='';
 if(q.type==='mcq') body=`<div class="options">${q.options.map((o,j)=>`<button type="button" class="option mcq-option" data-i="${i}" data-j="${j}"><span>${String.fromCharCode(2458+j)}) ${escapeHtml(o)}</span><b class="feedback-icon"></b></button>`).join('')}</div>`;
 else if(q.type==='true_false') body=`<div class="options tf-options"><button class="option tf-option" data-i="${i}" data-value="সত্য">সত্য</button><button class="option tf-option" data-i="${i}" data-value="মিথ্যা">মিথ্যা</button></div>`;
 else body=`<textarea class="answer-input" data-i="${i}" rows="3" placeholder="তোমার উত্তর লিখো..."></textarea>`;
 return `<article class="q-card" id="question-${i}"><div class="q-head"><span class="q-number">Question ${i+1}</span>${sol}</div><div class="q-text">${escapeHtml(q.question)}</div>${body}<div class="answer-status" id="status-${i}"></div></article>`;
}
function mark(i,correct){
 const card=document.getElementById(`question-${i}`);card.classList.remove('answered-correct','answered-wrong');card.classList.add(correct?'answered-correct':'answered-wrong');
 const status=document.getElementById(`status-${i}`);status.textContent=correct?'✓ সঠিক উত্তর':'✕ ভুল উত্তর';
 document.getElementById('progressPill').textContent=`${Object.keys(selected).length} / ${examData.questions.length}`;
}
function answerMCQ(i,j){if(selected[i])return;const q=examData.questions[i];const buttons=[...document.querySelectorAll(`.mcq-option[data-i="${i}"]`)];const correct=q.options[j]===q.answer;selected[i]={value:q.options[j],correct};buttons.forEach((b,k)=>{b.disabled=true;if(q.options[k]===q.answer)b.classList.add('correct-option');if(k===j&&!correct)b.classList.add('wrong-option');});mark(i,correct);}
function answerTF(i,value){if(selected[i])return;const q=examData.questions[i],correct=value===q.answer;selected[i]={value,correct};document.querySelectorAll(`.tf-option[data-i="${i}"]`).forEach(b=>{b.disabled=true;if(b.dataset.value===q.answer)b.classList.add('correct-option');if(b.dataset.value===value&&!correct)b.classList.add('wrong-option');});mark(i,correct);}
function normalize(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ');}
function submitPractice(){
 let correct=Object.values(selected).filter(x=>x.correct).length;
 examData.questions.forEach((q,i)=>{if(selected[i])return;const input=document.querySelector(`[data-i="${i}"].answer-input`);if(input&&input.value.trim()){const ok=normalize(input.value)===normalize(q.answer);selected[i]={value:input.value,correct:ok};mark(i,ok);}});
 correct=Object.values(selected).filter(x=>x.correct).length;
 sessionStorage.setItem('examResult',JSON.stringify({correct,total:examData.questions.length,title:examData.title,school:examData.school_name,subject:examData.subject_name}));location.href='result.html';
}
function showSolution(i){const q=examData.questions[i];if(!q.solution)return;document.getElementById('solutionContent').innerHTML=`<h2>💡 ${escapeHtml(q.question)}</h2><div class="solution-box"><h4>✓ সমাধান:</h4><ol>${q.solution.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol></div>`;document.getElementById('solutionModal').classList.remove('hidden');}
document.getElementById('closeSolution').addEventListener('click',()=>document.getElementById('solutionModal').classList.add('hidden'));
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
initExam().catch(e=>{document.getElementById('questionList').innerHTML='<div class="card" style="padding:25px">Question data could not be loaded. Run through a local web server.</div>';console.error(e)});