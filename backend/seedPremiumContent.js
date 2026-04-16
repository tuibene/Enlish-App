const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        
        const masterclass = await Course.findOne({ isPremium: true });
        if (!masterclass) {
            console.log('No premium course found to update.');
            process.exit(1);
        }

        masterclass.days = [
            {
                dayNumber: 1,
                title: 'Introduction to IELTS Task 2',
                description: 'Understand the core marking criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range.',
                content: `<h2>Mastering the IELTS Task 2 Rubric</h2><p>In this lesson, we break down what examiners actually look for. Many candidates fail to achieve a 7.0+ because they write "beautiful" English that completely misses the <strong>Task Response</strong> criteria.</p><ul><li>Always answer ALL parts of the prompt.</li><li>Present a clear position throughout the response.</li><li>Extend and support your main ideas.</li></ul><p>Tomorrow, we will look at how to structure a winning introduction.</p>`
            },
            {
                dayNumber: 2,
                title: 'The Perfect Introduction',
                description: 'Learn the "Hook, Background, Thesis" framework for crafting compelling introductions in under 5 minutes.',
                content: `<h2>Writing a Fast, Effective Introduction</h2><p>Your introduction is the examiner's first impression. It must be flawless but fast. You should spend no more than 5 minutes on it.</p><h3>The 2-Sentence Formula:</h3><ol><li><strong>Sentence 1 (Paraphrase):</strong> Rewrite the prompt using synonyms and structural changes.</li><li><strong>Sentence 2 (Thesis):</strong> Directly answer the question or state what the essay will discuss.</li></ol>`
            },
            {
                dayNumber: 3,
                title: 'Body Paragraph Structures (PEEL)',
                description: 'Master the Point, Evidence, Explanation, Link framework for bulletproof body paragraphs.',
                content: `<h2>The PEEL Method</h2><p>Every body paragraph needs a clear central topic. The PEEL method guarantees cohesion.</p><ul><li><strong>P</strong>oint: Your topic sentence.</li><li><strong>E</strong>vidence: An example or specific detail.</li><li><strong>E</strong>xplanation: How the evidence proves the point.</li><li><strong>L</strong>ink: Tying it back to the thesis statement.</li></ul>`
            },
            {
                dayNumber: 4,
                title: 'Advanced Lexical Resource (Vocabulary)',
                description: 'Transitioning from B2 common words to C1/C2 low-frequency vocabulary.',
                content: `<h2>Less Common Idiomatic Vocabulary</h2><p>To score an 8.0 in Lexical Resource, you must use "less common lexical items with some awareness of style and collocation." Stop using "bad" and start using "detrimental". Stop using "important" and start using "paramount".</p>`
            },
             {
                dayNumber: 5,
                title: 'Complex Grammar Variations',
                description: 'Using conditionals, relative clauses, and passive voice to boost Grammatical Range.',
                content: `<h2>Grammatical Range & Accuracy</h2><p>Your essay cannot just be simple sentences. Examiners look for a variety of complex structures. For instance, using <em>If... then...</em> (Conditionals) or <em>Not only... but also...</em> (Inversions).</p>`
            },
            {
                dayNumber: 6,
                title: 'Handling "Discuss Both Views" Prompts',
                description: 'How to remain objective while still presenting a clear position.',
                content: `<h2>Discuss Both Views and Give Your Opinion</h2><p>Structure this essay with one body paragraph for View A, one for View B, and ensure your introduction and conclusion clearly state which side you ultimately lean toward.</p>`
            },
            {
                dayNumber: 7,
                title: 'Handling "Problem & Solution" Prompts',
                description: 'Structuring essays that demand causes, effects, and viable solutions.',
                content: `<h2>Problem and Solution Essays</h2><p>Dedicate Body Paragraph 1 to the core causes of the issue, and Body Paragraph 2 to realistic, actionable solutions.</p>`
            },
            {
                 dayNumber: 8,
                 title: 'Mastering Punctuation & Cohesion',
                 description: 'Using semicolons, commas, and transitional devices correctly.',
                 content: `<h2>Advanced Cohesive Devices</h2><p>Stop overusing "Firstly", "Secondly", "In conclusion". Learn subtle transitioning like "Another compelling argument is..." or "Conversely,..."</p>`
             },
             {
                 dayNumber: 9,
                 title: 'Task 1 Academic: Line Graphs & Bar Charts',
                 description: 'Vocabulary for describing trends, peaks, troughs, and stability.',
                 content: `<h2>Describing Data Trends</h2><p>Words to master: <em>skyrocketed, plummeted, fluctuated wildly, reached a plateau.</em> Always include a clear overall overview summarizing the main trends without specific numbers.</p>`
             },
             {
                 dayNumber: 10,
                 title: 'Task 1 Academic: Maps & Processes',
                 description: 'Using the passive voice to describe geographical changes and manufacturing steps.',
                 content: `<h2>Maps and Cyclical Processes</h2><p>In process diagrams, the subject is often acted upon. Hence, the passive voice is mandatory (e.g., "The beans are harvested, then they are transported...").</p>`
             },
             {
                 dayNumber: 11,
                 title: 'Time Management in the Exam',
                 description: 'How to divide your 60 minutes efficiently between Task 1 and Task 2.',
                 content: `<h2>The 20/40 Rule</h2><p>Task 2 is worth twice as many points as Task 1. Never spend more than 20 minutes on Task 1. Always leave 3-5 minutes at the end of Task 2 to proofread for silly grammar slips.</p>`
             },
             {
                 dayNumber: 12,
                 title: 'Reviewing High-Scoring Band 9 Essays',
                 description: 'Deconstructing what makes a perfect score.',
                 content: `<h2>Band 9 Analysis</h2><p>Read the provided sample essays and note how the author integrates complex grammar effortlessly without sounding unnatural or "forced."</p>`
             },
             {
                 dayNumber: 13,
                 title: 'Writing Full Mock Test 1',
                 description: 'Simulate specific exam conditions using the built-in system.',
                 content: `<h2>Mock Test Day</h2><p>Navigate to the <b>Official IELTS Simulations</b> tab in the Exams section and complete the Writing Module strictly under timer conditions.</p>`
             },
             {
                 dayNumber: 14,
                 title: 'Final Strategy and Mindset',
                 description: 'Preparing your mind for test day.',
                 content: `<h2>Test Day Readiness</h2><p>Ensure you sleep well. Do not try to memorize new vocabulary the night before. Trust your training and the frameworks you have built over these 14 days.</p>`
             }
        ];

        masterclass.durationDays = 14;
        await masterclass.save();
        console.log('Successfully added 14 days of realistic IELTS content to Premium Course!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
