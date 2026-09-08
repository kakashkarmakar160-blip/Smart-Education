const MAX=20;
const LOWER_SUBJECTS=[
  ['bangla','বাংলা','Bengali'],['english','ইংরেজি','English'],['physics','Physics','Physics'],
  ['life-science','Life Science','Life Science'],['mathematics','গণিত','Mathematics'],
  ['geography','ভূগোল','Geography'],['history','ইতিহাস','History']
];
const HIGHER_SUBJECTS=[...LOWER_SUBJECTS,
  ['accountancy','Accountancy','Accountancy'],['commercial-law','Commercial Law','Commercial Law'],
  ['business-studies','Business Studies','Business Studies'],['computer-science','Computer Science','Computer Science'],
  ['costing','Costing','Costing']
];
const BANK_KEY='computerQuestionBanksV2';
const SEMESTERS=['1','2','3','4'];
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function getClassNumber(){
  const profile=readJSON('computerProfile',{});
  const q=params().get('class')||profile.className||'Class 12';
  const m=String(q).match(/(12|11|10|9|8|7|6|5)/);
  return m?Number(m[1]):12;
}
function normalizeSemester(value){
  const m=String(value||'').match(/[1-4]/);
  return m?m[0]:'1';
}
function getSemester(){
  const profile=readJSON('computerProfile',{});
  return normalizeSemester(params().get('semester')||profile.semester||'1');
}
function subjectsForClass(n=getClassNumber()){return n<=10?LOWER_SUBJECTS:HIGHER_SUBJECTS;}
function banks(){return readJSON(BANK_KEY,{});}
function cloneQuestions(source){return (source||[]).slice(0,MAX).map(q=>({...q,options:Array.isArray(q.options)?[...q.options]:undefined}));}
async function ensureBanks(){
  let b=banks();
  let base=[];
  try{const source=await loadJSON('data/computer/questions.json');base=cloneQuestions(source.questions||[])}catch(e){console.error(e)}
  if(!base.length)base=[{type:'mcq',question:'নতুন প্রশ্ন তৈরি করুন।',options:['Option A','Option B','Option C','Option D'],answer:'Option A',marks:1}];
  const old=readJSON('computerQuestionBanks',{});
  for(let c=5;c<=12;c++){
    for(const sem of SEMESTERS){
      for(const [id] of subjectsForClass(c)){
        const key=`class${c}|semester${sem}|${id}`;
        if(!Array.isArray(b[key])||!b[key].length){
          const legacy=(Array.isArray(old[id])&&c===getClassNumber()&&sem===getSemester())?old[id]:base;
          b[key]=cloneQuestions(legacy);
        }
        while(b[key].length<MAX&&b[key].length){
          const src=b[key][b[key].length%base.length]||base[0];
          b[key].push({...src,question:`${src.question} (প্রশ্ন ${b[key].length+1})`});
        }
        b[key]=b[key].slice(0,MAX);
      }
    }
  }
  localStorage.setItem(BANK_KEY,JSON.stringify(b));
  renderSubjectCards();
}
function renderSubjectCards(){
 const box=document.getElementById('subjectCards'),b=banks(),n=getClassNumber(),sem=getSemester(),subjects=subjectsForClass(n);
 document.getElementById('classLabel').textContent=`Class ${n} • Semester ${sem}`;
 box.innerHTML=subjects.map(([id,name,en])=>{
   const key=`class${n}|semester${sem}|${id}`;
   const count=Math.min(MAX,Array.isArray(b[key])?b[key].length:0);
   return `<article class="subject-paper-card"><div class="subject-icon">📘</div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(en)} • Semester ${sem}</p><div class="paper-count"><span>Questions</span><span class="count-badge">${count} / ${MAX}</span></div><a class="open-paper-btn" href="computer-exam.html?subject=${encodeURIComponent(id)}&class=${n}&semester=${sem}">Open Question Paper →</a></article>`;
 }).join('');
}
const profile=readJSON('computerProfile',{});
if(profile.name)document.getElementById('meta').textContent=[profile.name,`Class ${getClassNumber()}`,`Semester ${getSemester()}`].join(' • ');
const modal=document.getElementById('passwordModal'),pass=document.getElementById('computerAdminPassword'),msg=document.getElementById('passwordMsg');
document.getElementById('addPaperBtn').onclick=()=>{pass.value='';msg.textContent='';modal.classList.remove('hidden');setTimeout(()=>pass.focus(),50)};
function close(){modal.classList.add('hidden')}
document.getElementById('closePassword').onclick=close;
document.getElementById('unlockPaper').onclick=unlock;
pass.addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});
function unlock(){
 if(pass.value==='AK1234'){
   sessionStorage.setItem('computerEditorUnlocked','1');
   location.assign(`./computer-question-paper.html?class=${getClassNumber()}&semester=${getSemester()}`);
 }else msg.textContent='Password ভুল। শুধুমাত্র AK1234 কাজ করবে।';
}
ensureBanks();
