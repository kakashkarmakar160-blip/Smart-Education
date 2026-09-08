const qs = JSON.parse(
    localStorage.getItem('teacherQuestions') || '[]'
);

const count = document.getElementById('count');
if (count) count.textContent = qs.length;

const setName = document.getElementById('setName');
const target = document.getElementById('target');
const accessCode = document.getElementById('accessCode');

const saved = JSON.parse(
    localStorage.getItem('publishedSet') || 'null'
);

if (saved) {
    if (setName) setName.value = saved.name || setName.value;
    if (target) target.value = saved.target || '';
    if (accessCode) accessCode.value = saved.password || '';
}


// ===============================
// Generate Paper Password
// ===============================

function generate() {
    if (!accessCode) return;

    accessCode.value =
        'AK' +
        Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase();
}

const generateCode = document.getElementById('generateCode');

if (generateCode) {
    generateCode.onclick = generate;
}

if (accessCode && !accessCode.value) {
    generate();
}


// ===============================
// Publish Question Paper
// ===============================

const publishButton = document.getElementById('publish');

if (publishButton) {

    publishButton.onclick = async () => {

        try {

            // -------------------------------
            // Basic validation
            // -------------------------------

            if (!qs.length) {
                alert(
                    'Publish করার আগে অন্তত একটি question তৈরি করুন।'
                );
                return;
            }

            if (
                !setName.value.trim() ||
                !accessCode.value.trim()
            ) {
                alert(
                    'Question Set Name এবং Password দুটোই দিন।'
                );
                return;
            }


            // -------------------------------
            // Teacher profile
            // -------------------------------

            const tp = JSON.parse(
                localStorage.getItem('teacherProfile') || '{}'
            );

            const teacher =
                tp.name || 'Mr. Arindam Sen';

            const teacherCode =
                tp.id ||
                teacher
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-');


            // ==================================================
            // SUPABASE
            // ==================================================

            if (
                typeof supabaseClient === 'undefined'
            ) {
                alert(
                    'Supabase connection পাওয়া যায়নি।\n\n' +
                    'HTML-এ supabase.js সঠিকভাবে load হয়েছে কিনা দেখুন।'
                );
                return;
            }


            // -------------------------------
            // Find / Create Teacher
            // -------------------------------

            let teacherRow = null;


            const teacherResult =
                await supabaseClient
                    .from('teachers')
                    .select('id,name,teacher_code')
                    .eq('teacher_code', teacherCode)
                    .maybeSingle();


            if (teacherResult.error) {
                throw teacherResult.error;
            }


            teacherRow = teacherResult.data;


            // Teacher না থাকলে create
            if (!teacherRow) {

                const insertTeacher =
                    await supabaseClient
                        .from('teachers')
                        .insert({
                            name: teacher,
                            teacher_code: teacherCode
                        })
                        .select('id,name,teacher_code')
                        .single();


                if (insertTeacher.error) {
                    throw insertTeacher.error;
                }


                teacherRow = insertTeacher.data;
            }


            // Supabase-এর আসল UUID
            const supabaseTeacherId =
                teacherRow.id;


            // ==================================================
            // Create Question Paper
            // ==================================================

            const paperPassword =
                accessCode.value.trim();


            // Teacher profile থেকে information নেওয়া
            const className =
                tp.className ||
                tp.class ||
                '';

            const stream =
                tp.stream ||
                '';

            const subject =
                tp.subject ||
                '';

            const semester =
                Number(tp.semester) ||
                1;


            const paperType =
                'exam';


            const paperInsert =
                await supabaseClient
                    .from('question_papers')
                    .insert({

                        teacher_id:
                            supabaseTeacherId,

                        title:
                            setName.value.trim(),

                        class_name:
                            className,

                        stream:
                            stream,

                        subject:
                            subject,

                        semester:
                            semester,

                        paper_password:
                            paperPassword,

                        paper_type:
                            paperType,

                        max_questions:
                            Math.min(qs.length, 20),

                        is_published:
                            true

                    })
                    .select('*')
                    .single();


            if (paperInsert.error) {
                throw paperInsert.error;
            }


            const paperRow =
                paperInsert.data;


            const paperId =
                paperRow.id;


            // ==================================================
            // Save Questions
            // ==================================================

            const questionRows =
                qs.slice(0, 20).map((q, index) => ({

                    paper_id:
                        paperId,

                    question_number:
                        index + 1,

                    question_type:
                        q.question_type ||
                        q.type ||
                        q.questionType ||
                        'mcq',

                    question_text:
                        q.question_text ||
                        q.question ||
                        q.text ||
                        '',

                    option_a:
                        q.option_a ||
                        q.optionA ||
                        q.a ||
                        null,

                    option_b:
                        q.option_b ||
                        q.optionB ||
                        q.b ||
                        null,

                    option_c:
                        q.option_c ||
                        q.optionC ||
                        q.c ||
                        null,

                    option_d:
                        q.option_d ||
                        q.optionD ||
                        q.d ||
                        null,

                    correct_answer:
                        q.correct_answer ||
                        q.correctAnswer ||
                        q.answer ||
                        null,

                    marks:
                        Number(q.marks) || 1,

                    solution_text:
                        q.solution_text ||
                        q.solution ||
                        q.explanation ||
                        null

                }));


            const questionInsert =
                await supabaseClient
                    .from('questions')
                    .insert(questionRows);


            if (questionInsert.error) {
                throw questionInsert.error;
            }


            // ==================================================
            // LOCAL STORAGE
            // ==================================================

            const papers = JSON.parse(
                localStorage.getItem(
                    'teacherPublishedPapers'
                ) || '[]'
            );


            const published = {

                id:
                    paperId,

                name:
                    setName.value.trim(),

                target:
                    target.value.trim() ||
                    teacher,

                password:
                    paperPassword,

                questions:
                    qs,

                publishedAt:
                    new Date().toISOString(),

                teacher:
                    teacher,

                teacherId:
                    teacherCode,

                supabaseTeacherId:
                    supabaseTeacherId

            };


            papers.push(published);


            localStorage.setItem(
                'teacherPublishedPapers',
                JSON.stringify(papers)
            );


            localStorage.setItem(
                'teacherSetName',
                published.name
            );


            localStorage.setItem(
                'publishedSet',
                JSON.stringify(published)
            );


            // ==================================================
            // Success UI
            // ==================================================

            const code =
                document.getElementById(
                    'publishedCode'
                );

            if (code) {

                code.textContent =
                    published.password;

                code.classList.remove(
                    'hidden'
                );
            }


            const copyCode =
                document.getElementById(
                    'copyCode'
                );

            if (copyCode) {
                copyCode.classList.remove(
                    'hidden'
                );
            }


            const msg =
                document.getElementById('msg');

            if (msg) {

                msg.textContent =
                    '✓ Question paper published successfully to Supabase.';
            }


            alert(
                'Question Paper সফলভাবে Publish হয়েছে!\n\n' +
                'Paper এবং Questions Supabase-এ save হয়েছে।'
            );


        } catch (error) {

            console.error(
                'Publish Error:',
                error?.message || error,
                error
            );


            alert(
                'Publish করতে সমস্যা হয়েছে।\n\n' +
                error.message
            );

        }

    };

}


// ==================================================
// Copy Password
// ==================================================

const copyCode =
    document.getElementById('copyCode');

if (copyCode) {

    copyCode.onclick = async () => {

        const savedPaper =
            JSON.parse(
                localStorage.getItem(
                    'publishedSet'
                ) || '{}'
            );


        const code =
            savedPaper.password || '';


        try {

            await navigator.clipboard.writeText(
                code
            );

            const msg =
                document.getElementById('msg');

            if (msg) {
                msg.textContent =
                    '✓ Password copied.';
            }

        } catch {

            const msg =
                document.getElementById('msg');

            if (msg) {
                msg.textContent =
                    'Password: ' + code;
            }

        }

    };

}