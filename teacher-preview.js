const qs=JSON.parse(localStorage.getItem('teacherQuestions')||'[]');
const typeNames={mcq:'MCQ',long:'Long Question',fill_blank:'Fill in the Blanks',paragraph:'Paragraph Writing',true_false:'True / False',match:'Match the Following'};
const letters=['A','B','C','D'];
document.getElementById('paperTitle').textContent=localStorage.getItem('teacherSetName')||'Teacher Question Paper';
const meta=JSON.parse(localStorage.getItem('teacherDraftMeta')||'{}');
document.getElementById('paperMeta').textContent=[meta.className,meta.subject,`${qs.length} Questions`].filter(Boolean).join(' • ');
const list=document.getElementById('paperList');
if(!qs.length) list.innerHTML='<div class="card empty-paper">কোনো question নেই। <a class="primary" href="teacher-question.html">Create Question</a></div>';
else list.innerHTML=qs.map((q,i)=>{
 let body='';
 if(q.type==='mcq')body=`<div class="paper-options">${q.options.map((o,j)=>`<div>${letters[j]}) ${escapeHtml(o)}</div>`).join('')}</div>`;
 else if(q.type==='true_false')body='<div class="paper-options"><div>○ সত্য</div><div>○ মিথ্যা</div></div>';
 else if(q.type==='match')body=`<div class="paper-options">${(q.pairs||[]).map(p=>`<div>${escapeHtml(p.left)} — ${escapeHtml(p.right)}</div>`).join('')}</div>`;
 return `<article class="paper-question"><h3>${i+1}. ${typeNames[q.type]||q.type} <span class="tag">${q.marks} Marks</span></h3><div class="q-text">${escapeHtml(q.question)}</div>${body}<div class="answer-note">Correct / Model Answer: ${escapeHtml(q.answer)}</div></article>`;
}).join('');
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
