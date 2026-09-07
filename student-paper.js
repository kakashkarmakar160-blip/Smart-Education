const area=document.getElementById('paperArea');
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function getPapers(){const arr=JSON.parse(localStorage.getItem('teacherPublishedPapers')||'[]');const legacy=JSON.parse(localStorage.getItem('publishedSet')||'null');if(legacy&&!arr.some(x=>x.password===legacy.password))arr.push(legacy);return arr;}
function openPaper(){
 const code=document.getElementById('paperCode').value.trim(),papers=getPapers(),msg=document.getElementById('accessMsg');
 const pub=papers.find(x=>String(x.password||'').toLowerCase()===code.toLowerCase());
 if(!pub){msg.textContent=code?'Password/code সঠিক নয়।':'Password/code লিখুন।';return;}
 msg.textContent='';area.classList.remove('hidden');
 const body=(pub.questions||[]).map((q,i)=>{let extra='';if(q.type==='mcq')extra=`<div class="paper-options">${q.options.map((o,j)=>`<div>${String.fromCharCode(2458+j)}) ${escapeHtml(o)}</div>`).join('')}</div>`;else if(q.type==='true_false')extra='<div class="paper-options"><div>○ সত্য</div><div>○ মিথ্যা</div></div>';return `<article class="paper-question"><h3>${i+1}. ${escapeHtml(q.type||'QUESTION')} <span class="tag">${q.marks||1} Marks</span></h3><div class="q-text">${escapeHtml(q.question)}</div>${extra}</article>`;}).join('');
 area.innerHTML=`<section class="paper-head"><div><p class="eyebrow">PUBLISHED PAPER</p><h1>${escapeHtml(pub.name)}</h1><p class="muted">${escapeHtml(pub.target||pub.teacher||'')} • ${pub.questions.length} Questions</p></div><button id="startTeacherExam" class="primary">Start Practice →</button></section>${body}`;
 document.getElementById('startTeacherExam').onclick=()=>{sessionStorage.setItem('teacherExam',JSON.stringify(pub));location.assign(new URL('./teacher-exam.html', window.location.href).href);};
}
document.getElementById('openPaper').onclick=openPaper;document.getElementById('paperCode').addEventListener('keydown',e=>{if(e.key==='Enter')openPaper();});
