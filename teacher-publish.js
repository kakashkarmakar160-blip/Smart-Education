const qs=JSON.parse(localStorage.getItem('teacherQuestions')||'[]');
const count=document.getElementById('count');count.textContent=qs.length;
const setName=document.getElementById('setName'),target=document.getElementById('target'),accessCode=document.getElementById('accessCode');
const saved=JSON.parse(localStorage.getItem('publishedSet')||'null');
if(saved){setName.value=saved.name||setName.value;target.value=saved.target||'';accessCode.value=saved.password||'';}
function generate(){accessCode.value='AK'+Math.random().toString(36).slice(2,8).toUpperCase();}
document.getElementById('generateCode').onclick=generate;if(!accessCode.value)generate();
document.getElementById('publish').onclick=()=>{
 if(!qs.length){alert('Publish করার আগে অন্তত একটি question তৈরি করুন।');return;}
 if(!setName.value.trim()||!accessCode.value.trim()){alert('Question Set Name এবং Password দুটোই দিন।');return;}
 const tp=JSON.parse(localStorage.getItem('teacherProfile')||'{}');
 const teacher=tp.name||'Mr. Arindam Sen',teacherId=tp.id||teacher.toLowerCase().replace(/[^a-z0-9]+/g,'-');
 const papers=JSON.parse(localStorage.getItem('teacherPublishedPapers')||'[]');
 const id='paper-'+Date.now();
 const published={id,name:setName.value.trim(),target:target.value.trim()||teacher,password:accessCode.value.trim(),questions:qs,publishedAt:new Date().toISOString(),teacher,teacherId};
 papers.push(published);localStorage.setItem('teacherPublishedPapers',JSON.stringify(papers));
 localStorage.setItem('teacherSetName',published.name);localStorage.setItem('publishedSet',JSON.stringify(published));
 const code=document.getElementById('publishedCode');code.textContent=published.password;code.classList.remove('hidden');document.getElementById('copyCode').classList.remove('hidden');document.getElementById('msg').textContent='✓ Question paper published successfully.';
};
document.getElementById('copyCode').onclick=async()=>{const code=JSON.parse(localStorage.getItem('publishedSet')||'{}').password||'';try{await navigator.clipboard.writeText(code);document.getElementById('msg').textContent='✓ Password copied.';}catch{document.getElementById('msg').textContent='Password: '+code;}};
