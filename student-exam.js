let data=null,index=0,answers={},remaining=300,timerId;

async function getData(){
  const teacher=sessionStorage.getItem('teacherExam');
  if(teacher){
    data=JSON.parse(teacher);
  }else{
    const file=params().get('file')||'data/class5/bangla/school-01.json';
    try{data=await loadJSON(file)}catch{data=await loadJSON('data/class5/bangla/school-01.json');}
  }
  document.getElementById('examTitle').textContent=data.name||data.title||'Practice';
  render();startTimer();
}

function render(){
  const q=data.questions[index];
  document.getElementById('progress').textContent=`${index+1} / ${data.questions.length}`;
  document.getElementById('examMeta').textContent=`${data.school_name||data.target||''} • ${data.subject_name||q.subject||''}`;
  let html=`<div class="q-number">Question ${index+1} • ${q.marks||1} Marks</div><div class="q-text">${escapeHtml(q.question)}</div>`;
  if(q.type==='mcq'){
    html+=`<div class="answers">${q.options.map((o,j)=>`<button class="answer ${answers[index]?.chosen===j?(answers[index].correct?'correct':'wrong'):''}" data-j="${j}" ${answers[index]?'disabled':''}>${String.fromCharCode(2458+j)}) ${escapeHtml(o)}</button>`).join('')}</div>`;
  }else if(q.type==='true_false'){
    html+=`<div class="answers"><button class="answer ${answers[index]?.value==='সত্য'?(answers[index].correct?'correct':'wrong'):''}" data-value="সত্য" ${answers[index]?'disabled':''}>সত্য</button><button class="answer ${answers[index]?.value==='মিথ্যা'?(answers[index].correct?'correct':'wrong'):''}" data-value="মিথ্যা" ${answers[index]?'disabled':''}>মিথ্যা</button></div>`;
  }else{
    html+=`<textarea id="shortAnswer" class="field answer-input" placeholder="তোমার উত্তর লিখো..." ${answers[index]?'disabled':''}>${escapeHtml(answers[index]?.value||'')}</textarea>`;
  }
  if(answers[index]) html+=`<div class="feedback ${answers[index].correct?'good':'bad'}">${answers[index].correct?'✓ সঠিক উত্তর':'✕ ভুল উত্তর'} <span>• উত্তর আর পরিবর্তন করা যাবে না</span></div>`;
  document.getElementById('questionBox').innerHTML=html;
  document.querySelectorAll('.answer[data-j]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.j))));
  document.querySelectorAll('.answer[data-value]').forEach(b=>b.addEventListener('click',()=>chooseTF(b.dataset.value)));
  document.getElementById('nextBtn').textContent=index===data.questions.length-1?'See Result →':'Next Question →';
  document.getElementById('prevBtn').disabled=index===0;
}

function choose(j){
  if(answers[index])return;
  const q=data.questions[index],correct=q.options[j]===q.answer;
  answers[index]={chosen:j,value:q.options[j],correct};
  render();
}
function chooseTF(value){
  if(answers[index])return;
  const q=data.questions[index],correct=value===q.answer;
  answers[index]={value,correct};render();
}
function next(){
  const q=data.questions[index];
  if(q.type!=='mcq'&&q.type!=='true_false'&&!answers[index]){
    const val=document.getElementById('shortAnswer')?.value.trim();
    if(!val){document.getElementById('shortAnswer')?.focus();return;}
    answers[index]={value:val,correct:normalize(val)===normalize(q.answer)};
    render();return;
  }
  if(index<data.questions.length-1){index++;render();}else finish();
}
function prev(){if(index>0){index--;render();}}
function finish(){
  const correct=Object.values(answers).filter(x=>x.correct).length;
  const attempted=Object.keys(answers).length;
  const totalMarks=data.questions.reduce((s,q)=>s+Number(q.marks||1),0);
  const obtained=Object.entries(answers).reduce((s,[i,a])=>s+(a.correct?Number(data.questions[i].marks||1):0),0);
  const percentage=totalMarks?Math.round(obtained/totalMarks*100):0;
  const student=JSON.parse(localStorage.getItem('studentProfile')||'{}');
  const teacher= data.teacher || data.target || 'Teacher';
  const teacherId=data.teacherId || String(teacher).toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const result={id:'result-'+Date.now(),paperId:data.id||('paper-'+(data.password||'')),paperPassword:data.password||'',teacher,teacherId,student:{name:student.name||'Student',id:student.id||''},studentName:student.name||'Student',title:data.name||data.title||'Practice Result',school:data.school_name||data.target||'',subject:data.subject_name||'',correct,total:data.questions.length,attempted,wrong:Math.max(0,attempted-correct),unattempted:Math.max(0,data.questions.length-attempted),obtained,totalMarks,percentage,date:new Date().toISOString(),answers,questions:data.questions};
  const history=JSON.parse(localStorage.getItem('studentResults')||'[]');history.unshift(result);localStorage.setItem('studentResults',JSON.stringify(history));
  const teacherResults=JSON.parse(localStorage.getItem('teacherResults')||'[]');teacherResults.unshift(result);localStorage.setItem('teacherResults',JSON.stringify(teacherResults));
  sessionStorage.setItem('examResult',JSON.stringify(result));sessionStorage.removeItem('teacherExam');location.href='student-result.html?resultId='+encodeURIComponent(result.id);
}
function normalize(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ');}
function startTimer(){clearInterval(timerId);remaining=300;timerId=setInterval(()=>{remaining--;const m=String(Math.floor(remaining/60)).padStart(2,'0'),s=String(remaining%60).padStart(2,'0');document.getElementById('timer').textContent=`${m}:${s}`;if(remaining<=0){clearInterval(timerId);finish();}},1000);}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
document.getElementById('nextBtn').addEventListener('click',next);
document.getElementById('prevBtn').addEventListener('click',prev);
document.getElementById('backExam').addEventListener('click',()=>{if(sessionStorage.getItem('teacherExam')) location.assign('./student-paper.html'); else history.back();});
getData().catch(console.error);
