const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

const LISTENING_BASE = 'https://www.soundhelix.com/examples/mp3';

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
                phase: 'Foundation',
                content: `<h2>Mastering the IELTS Task 2 Rubric</h2><p>In this lesson, we break down what examiners actually look for. Many candidates fail to achieve a 7.0+ because they write "beautiful" English that completely misses the <strong>Task Response</strong> criteria.</p><ul><li>Always answer ALL parts of the prompt.</li><li>Present a clear position throughout the response.</li><li>Extend and support your main ideas.</li></ul><p>Tomorrow, we will look at how to structure a winning introduction.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'coherence', phonetic: '/kəʊˈhɪərəns/', partOfSpeech: 'noun', definition: 'The quality of being logical, consistent, and forming a unified whole', example: 'Your essay must demonstrate coherence through logical paragraph ordering.', vietnameseMeaning: 'Sự mạch lạc' },
                        { word: 'cohesion', phonetic: '/kəʊˈhiːʒən/', partOfSpeech: 'noun', definition: 'The action of forming a united whole through linking devices', example: 'Use cohesive devices to connect your ideas smoothly.', vietnameseMeaning: 'Sự liên kết' },
                        { word: 'criterion', phonetic: '/kraɪˈtɪəriən/', partOfSpeech: 'noun', definition: 'A standard by which something is judged (plural: criteria)', example: 'Each marking criterion is worth 25% of your total band score.', vietnameseMeaning: 'Tiêu chí' },
                        { word: 'rubric', phonetic: '/ˈruːbrɪk/', partOfSpeech: 'noun', definition: 'A set of guidelines or criteria used for assessment', example: 'Understanding the scoring rubric is essential for achieving a high band.', vietnameseMeaning: 'Tiêu chí chấm điểm' },
                        { word: 'articulate', phonetic: '/ɑːˈtɪkjʊleɪt/', partOfSpeech: 'verb/adj', definition: 'To express ideas clearly and effectively', example: 'A band 7+ candidate can articulate complex ideas fluently.', vietnameseMeaning: 'Diễn đạt rõ ràng' },
                        { word: 'elaborate', phonetic: '/ɪˈlæbərət/', partOfSpeech: 'verb', definition: 'To develop or present in further detail', example: 'You need to elaborate on your main ideas with specific examples.', vietnameseMeaning: 'Triển khai chi tiết' }
                    ],
                    reading: {
                        title: 'Understanding the IELTS Band Descriptors',
                        passage: 'The IELTS Writing test is assessed using four criteria, each contributing equally to the overall band score. Task Response evaluates whether the candidate has fully addressed all parts of the question and presented a clear position throughout. Coherence and Cohesion examines the logical organization of ideas and the effective use of linking devices such as "however," "furthermore," and "consequently."\n\nLexical Resource measures the range and accuracy of vocabulary used, with higher bands requiring the use of less common lexical items and awareness of collocation. Finally, Grammatical Range and Accuracy assesses the variety of sentence structures used and the frequency of errors.\n\nA common misconception among test-takers is that sophisticated vocabulary alone guarantees a high score. In reality, a candidate who writes clearly and addresses the prompt fully can achieve Band 7 even with relatively simple language. Conversely, a candidate who uses impressive vocabulary but fails to answer the question may score as low as Band 5 in Task Response.\n\nExaminers are trained to assess each criterion independently, meaning a strong performance in one area cannot compensate for a weak performance in another. This is why balanced preparation across all four areas is crucial for achieving a target score of 7.0 or above.',
                        questions: [
                            { question: 'How many criteria are used to assess IELTS Writing?', options: ['Two', 'Three', 'Four', 'Five'], correctAnswer: 'Four', explanation: 'The passage states "The IELTS Writing test is assessed using four criteria."' },
                            { question: 'What can happen if a candidate uses impressive vocabulary but fails to answer the question?', options: ['They still score Band 7', 'They may score as low as Band 5 in Task Response', 'They get bonus points for vocabulary', 'The examiner ignores the issue'], correctAnswer: 'They may score as low as Band 5 in Task Response', explanation: 'The passage says "a candidate who uses impressive vocabulary but fails to answer the question may score as low as Band 5."' },
                            { question: 'Can a strong performance in one criterion compensate for weakness in another?', options: ['Yes, always', 'Only for vocabulary', 'No, each criterion is assessed independently', 'Only at higher bands'], correctAnswer: 'No, each criterion is assessed independently', explanation: 'The passage states "a strong performance in one area cannot compensate for a weak performance in another."' }
                        ]
                    },
                    listening: {
                        title: 'IELTS Examiner Explains Band Scoring',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-1.mp3`,
                        transcript: 'Today we will discuss the four band descriptors that IELTS examiners use to evaluate your writing. The first criterion is Task Response, which is worth 25 percent of your score. This measures whether you have answered all parts of the question. The second is Coherence and Cohesion — how well your ideas flow. Third is Lexical Resource, your vocabulary range. And finally, Grammatical Range and Accuracy. Each band from 5 to 9 has specific descriptors that examiners match your writing against.',
                        questions: [
                            { question: 'What percentage is Task Response worth?', options: ['10%', '20%', '25%', '50%'], correctAnswer: '25%', explanation: 'The speaker says "Task Response, which is worth 25 percent of your score."' },
                            { question: 'What does Coherence and Cohesion measure?', options: ['Vocabulary range', 'Grammar accuracy', 'How well ideas flow', 'Spelling'], correctAnswer: 'How well ideas flow', explanation: 'The speaker explains it measures "how well your ideas flow."' },
                            { question: 'What band range has specific descriptors?', options: ['Band 1 to 5', 'Band 3 to 8', 'Band 5 to 9', 'Band 6 to 9'], correctAnswer: 'Band 5 to 9', explanation: 'The speaker mentions "Each band from 5 to 9 has specific descriptors."' }
                        ]
                    },
                    speaking: {
                        prompt: 'In your opinion, which of the four IELTS Writing criteria is the most important for achieving a high score? Discuss your reasoning.',
                        sampleAnswer: 'I believe Task Response is the most critical criterion because no matter how sophisticated your vocabulary or grammar is, if you do not answer the question properly, you cannot score above Band 5 in that area. Many students focus excessively on memorizing complex words while neglecting to carefully read and address all parts of the prompt. A balanced approach is ideal, but if I had to prioritize, Task Response would be my foundation.',
                        tips: ['Give a clear opinion at the start', 'Explain WHY you chose that criterion', 'Acknowledge other criteria briefly', 'Use examples from your own experience'],
                        durationSeconds: 90
                    },
                    grammar: {
                        title: 'Identifying Word Classes',
                        lesson: 'In IELTS Writing, using the correct part of speech is crucial for Lexical Resource and Grammar score.',
                        questions: [
                            { instruction: 'Choose the correct form', question: 'The candidate needs to ________ (articulate) their ideas clearly.', options: ['articulate', 'articulation', 'articulated'], correctAnswer: 'articulate', type: 'multiple-choice' },
                            { instruction: 'Fill in the blank', question: 'Logical ________ (cohere) is essential for a high band score.', correctAnswer: 'coherence', type: 'fill-in', explanation: 'Noun form of coherent/cohere is needed here.' }
                        ]
                    },
                    writing: {
                        title: 'Task 2: Idea Generation',
                        prompt: 'Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: [
                            'Identify the two views clearly.',
                            'Brainstorm 2 points for prison and 2 points for alternatives.',
                            'Make sure your opinion is stated in the introduction.'
                        ],
                        criteria: [
                            'Did I discuss the "longer prison sentences" view?',
                            'Did I discuss the "alternative ways" view?',
                            'Is my opinion clear?',
                            'Did I use PEEL structure?'
                        ],
                        modelAnswer: 'It is often argued that harsher prison sentences are the most effective deterrent against criminal behavior...'
                    }
                }
            },
            {
                dayNumber: 2,
                title: 'The Perfect Introduction',
                description: 'Learn the "Hook, Background, Thesis" framework for crafting compelling introductions in under 5 minutes.',
                phase: 'Foundation',
                content: `<h2>Writing a Fast, Effective Introduction</h2><p>Your introduction is the examiner's first impression. It must be flawless but fast. You should spend no more than 5 minutes on it.</p><h3>The 2-Sentence Formula:</h3><ol><li><strong>Sentence 1 (Paraphrase):</strong> Rewrite the prompt using synonyms and structural changes.</li><li><strong>Sentence 2 (Thesis):</strong> Directly answer the question or state what the essay will discuss.</li></ol>`,
                tasks: {
                    vocabulary: [
                        { word: 'paraphrase', phonetic: '/ˈpærəfreɪz/', partOfSpeech: 'verb/noun', definition: 'To express the same meaning using different words', example: 'Paraphrasing the question is essential for a strong introduction.', vietnameseMeaning: 'Diễn đạt lại' },
                        { word: 'thesis', phonetic: '/ˈθiːsɪs/', partOfSpeech: 'noun', definition: 'A statement or central argument in an essay', example: 'Your thesis statement should clearly outline your position.', vietnameseMeaning: 'Luận điểm chính' },
                        { word: 'assert', phonetic: '/əˈsɜːt/', partOfSpeech: 'verb', definition: 'To state something confidently and forcefully', example: 'The writer asserts that technology has improved education.', vietnameseMeaning: 'Khẳng định' },
                        { word: 'contend', phonetic: '/kənˈtend/', partOfSpeech: 'verb', definition: 'To argue or assert that something is the case', example: 'Some experts contend that online learning is more effective.', vietnameseMeaning: 'Tranh luận, cho rằng' },
                        { word: 'synopsis', phonetic: '/sɪˈnɒpsɪs/', partOfSpeech: 'noun', definition: 'A brief summary of the main points', example: 'Your introduction should include a brief synopsis of your argument.', vietnameseMeaning: 'Tóm tắt' },
                        { word: 'succinct', phonetic: '/səkˈsɪŋkt/', partOfSpeech: 'adjective', definition: 'Briefly and clearly expressed', example: 'A succinct introduction sets the tone for the entire essay.', vietnameseMeaning: 'Ngắn gọn, súc tích' }
                    ],
                    reading: {
                        title: 'Analyzing Effective IELTS Introductions',
                        passage: 'The introduction is arguably the most important paragraph of an IELTS essay, yet many candidates spend too much time on it. An effective Task 2 introduction needs only two sentences. The first sentence should paraphrase the question prompt — rewriting it using synonyms and structural changes to demonstrate lexical range. The second sentence should present the thesis: a clear statement of the writer\'s position.\n\nConsider this prompt: "Some people think that governments should spend money on railways rather than roads. To what extent do you agree?" A weak introduction might copy the question word-for-word. A strong introduction would paraphrase: "There is an ongoing debate about whether public funds should be allocated primarily to rail infrastructure rather than road networks." The thesis would follow: "This essay argues that while both forms of transport merit investment, railways offer superior long-term benefits for urban areas."\n\nThe key mistake to avoid is writing a three-to-four sentence introduction that includes unnecessary background information or definitions. Examiners do not award extra marks for longer introductions. In fact, a lengthy introduction often indicates poor time management, leaving insufficient time for the body paragraphs where the real scoring happens.',
                        questions: [
                            { question: 'How many sentences does an effective Task 2 introduction need?', options: ['One', 'Two', 'Three', 'Four'], correctAnswer: 'Two', explanation: 'The passage states "An effective Task 2 introduction needs only two sentences."' },
                            { question: 'What should the first sentence of the introduction do?', options: ['Define key terms', 'Copy the question', 'Paraphrase the question prompt', 'Give a personal opinion'], correctAnswer: 'Paraphrase the question prompt', explanation: 'The first sentence "should paraphrase the question prompt."' },
                            { question: 'Why is a lengthy introduction a problem?', options: ['It bores the examiner', 'It indicates poor time management', 'It reduces vocabulary score', 'Examiners stop reading'], correctAnswer: 'It indicates poor time management', explanation: 'A lengthy introduction "indicates poor time management, leaving insufficient time for the body paragraphs."' }
                        ]
                    },
                    listening: {
                        title: 'Writing Coach: Introduction Techniques',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-2.mp3`,
                        transcript: 'Many students overthink the introduction paragraph. Remember, it should take no more than five minutes. Start by rewriting the question in your own words. Then add your thesis — what is your answer to the question? Do not copy directly from the prompt. Use synonyms. For example, if the question says "increasing numbers of people," you could write "a growing proportion of the population." This simple technique immediately shows the examiner your vocabulary range.',
                        questions: [
                            { question: 'How long should you spend on the introduction?', options: ['2 minutes', '5 minutes', '10 minutes', '15 minutes'], correctAnswer: '5 minutes', explanation: 'The speaker says "it should take no more than five minutes."' },
                            { question: 'What should you NOT do in the introduction?', options: ['Use synonyms', 'Write your thesis', 'Copy directly from the prompt', 'Paraphrase the question'], correctAnswer: 'Copy directly from the prompt', explanation: 'The speaker warns "Do not copy directly from the prompt."' },
                            { question: 'What is an example synonym for "increasing numbers of people"?', options: ['Many individuals', 'A growing proportion of the population', 'Lots of humans', 'Everyone'], correctAnswer: 'A growing proportion of the population', explanation: 'The speaker gives this specific example as a synonym.' }
                        ]
                    },
                    speaking: {
                        prompt: 'Practice paraphrasing: Take this IELTS prompt and create a 2-sentence introduction out loud — "Some people believe that university education should be free for everyone. To what extent do you agree or disagree?"',
                        sampleAnswer: 'There is a widespread debate about whether higher education should be provided at no cost to all students. While I acknowledge the financial burden of tuition fees, I believe that completely free university education is neither sustainable nor equitable, and a system of means-tested scholarships would be more effective.',
                        tips: ['Paraphrase key words: university → higher education, free → at no cost', 'State your position clearly in sentence 2', 'Practice speaking your introduction naturally, not reading', 'Time yourself — aim for under 30 seconds'],
                        durationSeconds: 60
                    },
                    grammar: {
                        title: 'Synonym Substitution',
                        lesson: 'Avoid repeating words from the prompt. Use synonyms correctly.',
                        questions: [
                            { instruction: 'Find the synonym', question: 'Which word is a synonym for "increasing"?', options: ['burgeoning', 'diminishing', 'stagnant'], correctAnswer: 'burgeoning', type: 'multiple-choice' },
                            { instruction: 'Paraphrase the phrase', question: 'Rewrite "many people": ________', correctAnswer: 'a significant proportion of the population', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Task 2: Introduction Writing',
                        prompt: 'Environmental pollution is a growing concern. Some say the government should take lead, others say individuals are responsible. Discuss.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: [
                            'Write your 2-sentence introduction in under 5 minutes.',
                            'Sentence 1: Paraphrase the prompt.',
                            'Sentence 2: Thesis statement + outline.'
                        ],
                        criteria: [
                            'Is it under 50 words?',
                            'Did I avoid copying the prompt?'
                        ]
                    }
                }
            },
            {
                dayNumber: 3,
                title: 'Body Paragraph Structures (PEEL)',
                description: 'Master the Point, Evidence, Explanation, Link framework for bulletproof body paragraphs.',
                phase: 'Foundation',
                content: `<h2>The PEEL Method</h2><p>Every body paragraph needs a clear central topic. The PEEL method guarantees cohesion.</p><ul><li><strong>P</strong>oint: Your topic sentence.</li><li><strong>E</strong>vidence: An example or specific detail.</li><li><strong>E</strong>xplanation: How the evidence proves the point.</li><li><strong>L</strong>ink: Tying it back to the thesis statement.</li></ul>`,
                tasks: {
                    vocabulary: [
                        { word: 'substantiate', phonetic: '/səbˈstænʃieɪt/', partOfSpeech: 'verb', definition: 'To provide evidence to support or prove a claim', example: 'You must substantiate your argument with concrete examples.', vietnameseMeaning: 'Chứng minh, chứng thực' },
                        { word: 'exemplify', phonetic: '/ɪɡˈzemplɪfaɪ/', partOfSpeech: 'verb', definition: 'To serve as a typical example of something', example: 'This paragraph exemplifies the PEEL structure perfectly.', vietnameseMeaning: 'Minh họa, làm ví dụ' }
                    ],
                    reading: {
                        title: 'The PEEL Method in Action',
                        passage: 'The PEEL structure provides a systematic framework for constructing body paragraphs...',
                        questions: [
                            { question: 'Which PEEL component do many students fall short on?', options: ['Point', 'Evidence', 'Explanation', 'Link'], correctAnswer: 'Explanation', explanation: 'The passage states "The Explanation component is where many students fall short."' }
                        ]
                    },
                    listening: {
                        title: 'Writing Tutor: Building Strong Paragraphs',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-3.mp3`,
                        transcript: 'The number one mistake I see in body paragraphs is the missing explanation...',
                        questions: [
                            { question: 'What is the number one mistake in body paragraphs?', options: ['Missing topic sentence', 'Missing explanation', 'Too many examples', 'Short sentences'], correctAnswer: 'Missing explanation', explanation: 'The speaker says "The number one mistake I see in body paragraphs is the missing explanation."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Using the PEEL structure, construct a body paragraph out loud on this topic: "Social media has more disadvantages than advantages for young people."',
                        sampleAnswer: 'One significant disadvantage of social media...',
                        tips: ['Start with a clear Point (topic sentence)', 'Provide specific Evidence (real or realistic data)'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'PEEL Sentence Construction',
                        lesson: 'Connect your examples back to your main point smoothly.',
                        questions: [
                            { instruction: 'Forming sentences', question: 'Which linking word fits best?', options: ['Therefore', 'But', 'However'], correctAnswer: 'Therefore', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'PEEL Body Paragraph Practice',
                        prompt: 'Write a full PEEL body paragraph stating one major disadvantage of online learning.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Ensure your explanation clearly connects evidence to the point.'],
                        criteria: ['Includes all 4 PEEL elements']
                    }
                }
            },
            {
                dayNumber: 4,
                title: 'Advanced Lexical Resource',
                description: 'Transitioning from B2 common words to C1/C2 low-frequency vocabulary for IELTS Writing.',
                phase: 'Foundation',
                content: `<h2>Less Common Idiomatic Vocabulary</h2><p>To score an 8.0 in Lexical Resource, you must use "less common lexical items with some awareness of style and collocation." Stop using "bad" and start using "detrimental". Stop using "important" and start using "paramount".</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'paramount', phonetic: '/ˈpærəmaʊnt/', partOfSpeech: 'adjective', definition: 'More important than anything else; supreme', example: 'Education is of paramount importance for economic growth.', vietnameseMeaning: 'Tối quan trọng' }
                    ],
                    reading: {
                        title: 'Upgrading Your Writing Vocabulary',
                        passage: 'One of the most effective strategies for improving your Lexical Resource score is building a repertoire of academic collocations...',
                        questions: [
                            { question: 'What should you focus on instead of memorizing isolated words?', options: ['Grammar rules', 'How words naturally combine (collocations)', 'Pronunciation', 'Spelling patterns'], correctAnswer: 'How words naturally combine (collocations)', explanation: 'The passage says "focus on how words naturally combine."' }
                        ]
                    },
                    listening: {
                        title: 'Vocabulary Upgrade Workshop',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-4.mp3`,
                        transcript: 'Let me give you some simple word upgrades...',
                        questions: [
                            { question: 'What word can replace "important"?', options: ['Interesting', 'Paramount', 'Basic', 'Regular'], correctAnswer: 'Paramount', explanation: 'The speaker suggests "crucial, vital, or paramount" as replacements for "important."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Describe the importance of vocabulary in academic writing.',
                        sampleAnswer: 'Vocabulary plays a paramount role in academic writing...',
                        tips: ['Use collocations naturally'],
                        durationSeconds: 90
                    },
                    grammar: {
                        title: 'Collocation & Word Choice',
                        lesson: 'Understand how words naturally sound best when grouped together.',
                        questions: [
                            { instruction: 'Choose collocation', question: 'Which word goes best with "role"?', options: ['Play', 'Do', 'Make'], correctAnswer: 'Play', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Advanced Vocabulary in Context',
                        prompt: 'Rewrite the given simple paragraph using advanced C1 vocabulary.',
                        taskType: 'essay',
                        wordLimit: 150,
                        tips: ['Replace 5 basic adjectives completely.'],
                        criteria: ['Used 5 advanced collocations correctly']
                    }
                }
            },
            {
                dayNumber: 5,
                title: 'Complex Grammar Variations',
                description: 'Using conditionals, relative clauses, and passive voice to boost Grammatical Range.',
                phase: 'Building',
                content: `<h2>Grammatical Range & Accuracy</h2><p>Your essay cannot just be simple sentences. Examiners look for a variety of complex structures. For instance, using <em>If... then...</em> (Conditionals) or <em>Not only... but also...</em> (Inversions).</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'notwithstanding', phonetic: '/ˌnɒtwɪθˈstændɪŋ/', partOfSpeech: 'preposition', definition: 'In spite of; despite', example: 'Notwithstanding the challenges, the project was completed on time.', vietnameseMeaning: 'Mặc dù' }
                    ],
                    reading: {
                        title: 'Grammar Structures That Impress Examiners',
                        passage: 'The Grammatical Range and Accuracy criterion rewards candidates who demonstrate a variety of complex sentence structures...',
                        questions: [
                            { question: 'At Band 7, what do examiners expect regarding complex structures?', options: ['All sentences must be complex', 'A variety of complex structures with frequent error-free sentences', 'Only simple sentences', 'Perfect grammar throughout'], correctAnswer: 'A variety of complex structures with frequent error-free sentences', explanation: 'The passage states Band 7 looks for "a variety of complex structures with frequent error-free sentences."' }
                        ]
                    },
                    listening: {
                        title: 'Grammar Workshop for Band 7+',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-1.mp3`,
                        transcript: 'Today we focus on three grammar structures...',
                        questions: [
                            { question: 'Which conditional form is more formal?', options: ['If they invested', 'If they were to invest', 'If they will invest', 'If investing'], correctAnswer: 'If they were to invest', explanation: 'The speaker says "were to invest — this is more formal."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Discuss whether technology has more advantages or disadvantages for society. Use complex grammar structures.',
                        sampleAnswer: 'If governments were to regulate technology...',
                        tips: ['Use conditionals: "If... were to..., ... would..."'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Conditionals (Type 2 & 3)',
                        lesson: 'Use conditionals to explore hypothetical situations that support your points.',
                        questions: [
                            { instruction: 'Complete the sentence', question: 'If the government ______ (invest) more, schools would be better.', correctAnswer: 'invested', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Complex Sentence Essay',
                        prompt: 'Write an essay discussing the benefits of space exploration.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Include at least one Type 2 conditional', 'Include at least one inversion'],
                        criteria: ['Used wide variety of sentence structures']
                    }
                }
            },
            {
                dayNumber: 6,
                title: 'Handling "Discuss Both Views" Prompts',
                description: 'How to remain objective while still presenting a clear position.',
                phase: 'Building',
                content: `<h2>Discuss Both Views and Give Your Opinion</h2><p>Structure this essay with one body paragraph for View A, one for View B, and ensure your introduction and conclusion clearly state which side you ultimately lean toward.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'proponent', phonetic: '/prəˈpəʊnənt/', partOfSpeech: 'noun', definition: 'A person who advocates for something', example: 'Proponents of free education argue it reduces inequality.', vietnameseMeaning: 'Người ủng hộ' }
                    ],
                    reading: {
                        title: 'Mastering the "Discuss Both Views" Essay',
                        passage: 'The "Discuss both views and give your opinion" essay type is one of the most common...',
                        questions: [
                            { question: 'What mistake do many candidates make with this essay type?', options: ['Writing too much', 'Sitting on the fence or being too biased', 'Using too many examples', 'Writing three body paragraphs'], correctAnswer: 'Sitting on the fence or being too biased', explanation: 'The passage mentions candidates either "sitting on the fence" or "being so biased."' }
                        ]
                    },
                    listening: {
                        title: 'Essay Planning Workshop: Both Views',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-2.mp3`,
                        transcript: 'When you see "discuss both views," do not panic. Spend two minutes planning...',
                        questions: [
                            { question: 'Where does the view you disagree with go?', options: ['Introduction', 'Body paragraph 1', 'Body paragraph 2', 'Conclusion'], correctAnswer: 'Body paragraph 1', explanation: 'The speaker says "The view you disagree with goes in body paragraph one."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Some people think children should start learning foreign languages early. Discuss both views.',
                        sampleAnswer: 'While some educators argue...',
                        tips: ['Acknowledge the opposing view first'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Concessive Clauses',
                        lesson: 'Use phrases like "while", "although", and "despite" to contrast the two views.',
                        questions: [
                            { instruction: 'Forming contrast', question: '____ many people support this, I disagree.', options: ['Although', 'Because', 'Hence'], correctAnswer: 'Although', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Discuss Both Views Essay',
                        prompt: 'Some think art should be funded by government, others think it should come from private sources. Discuss.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Allocate exactly one paragraph per viewpoint.', 'State your opinion clearly in intro and conclusion.'],
                        criteria: ['Fairly discussed both sides']
                    }
                }
            },
            {
                dayNumber: 7,
                title: 'Problem & Solution Essays',
                description: 'Structuring essays that demand causes, effects, and viable solutions.',
                phase: 'Building',
                content: `<h2>Problem and Solution Essays</h2><p>Dedicate Body Paragraph 1 to the core causes of the issue, and Body Paragraph 2 to realistic, actionable solutions.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'mitigate', phonetic: '/ˈmɪtɪɡeɪt/', partOfSpeech: 'verb', definition: 'To make something less severe, serious, or painful', example: 'Planting trees can mitigate the effects of urban pollution.', vietnameseMeaning: 'Giảm nhẹ' }
                    ],
                    reading: {
                        title: 'Writing Effective Problem-Solution Essays',
                        passage: 'Problem-solution essays require a different structure than opinion or discussion essays...',
                        questions: [
                            { question: 'What goes in the first body paragraph of a problem-solution essay?', options: ['Solutions', 'Analysis of causes', 'Your opinion', 'Examples from other countries'], correctAnswer: 'Analysis of causes', explanation: 'The passage says "the first body paragraph to analyzing the causes of the problem."' }
                        ]
                    },
                    listening: {
                        title: 'Problem-Solution Essay Strategies',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-3.mp3`,
                        transcript: 'For problem-solution essays, always match your solutions to your causes...',
                        questions: [
                            { question: 'What must solutions be matched to?', options: ['The conclusion', 'The causes identified', 'The introduction', 'Other essays'], correctAnswer: 'The causes identified', explanation: 'The speaker says "always match your solutions to your causes."' }
                        ]
                    },
                    speaking: {
                        prompt: 'What are the main causes of air pollution in cities, and what solutions would you propose?',
                        sampleAnswer: 'The primary causes of urban air pollution are...',
                        tips: ['Identify 2-3 specific causes first'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Cause-Effect Connectors',
                        lesson: 'Learn the difference between due to, because of, resulting in, and causing.',
                        questions: [
                            { instruction: 'Fill missing connector', question: 'The pollution increased ____ to the factories.', correctAnswer: 'due', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Problem-Solution Essay',
                        prompt: 'Obesity rates are rising worldwide. What are the causes of this and what solutions can you propose?',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Make sure your solutions directly address the causes mentioned earlier.'],
                        criteria: ['Used appropriate cause-effect connectors']
                    }
                }
            },
            {
                dayNumber: 8,
                title: 'Mastering Punctuation & Cohesion',
                description: 'Using semicolons, commas, and transitional devices correctly.',
                phase: 'Building',
                content: `<h2>Advanced Cohesive Devices</h2><p>Stop overusing "Firstly", "Secondly", "In conclusion". Learn subtle transitioning like "Another compelling argument is..." or "Conversely,..."</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'furthermore', phonetic: '/ˌfɜːðəˈmɔːr/', partOfSpeech: 'adverb', definition: 'In addition; besides', example: 'The policy reduced costs; furthermore, it improved efficiency.', vietnameseMeaning: 'Hơn nữa' }
                    ],
                    reading: {
                        title: 'Cohesive Devices Beyond "Firstly, Secondly"',
                        passage: 'Many IELTS candidates rely on a limited set of connecting words...',
                        questions: [
                            { question: 'What does overusing "Firstly, Secondly, In conclusion" signal?', options: ['Excellent organization', 'A limited range of cohesive devices', 'Strong vocabulary', 'Good time management'], correctAnswer: 'A limited range of cohesive devices', explanation: 'The passage says "overusing them signals a limited range of cohesive devices."' }
                        ]
                    },
                    listening: {
                        title: 'Linking Words Masterclass',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-4.mp3`,
                        transcript: 'Stop using "Firstly" and "Secondly" in every essay...',
                        questions: [
                            { question: 'What should replace "Firstly"?', options: ['To begin with', 'One compelling argument is...', 'First and foremost', 'At first'], correctAnswer: 'One compelling argument is...', explanation: 'The speaker suggests "One compelling argument is..." as a replacement.' }
                        ]
                    },
                    speaking: {
                        prompt: 'Practice using advanced linking words. Discuss the advantages and disadvantages of living in a big city.',
                        sampleAnswer: 'Living in a major city offers numerous advantages...',
                        tips: ['Try: moreover, nevertheless, consequently, on balance'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Semicolons & Advanced Punctuation',
                        lesson: 'A semicolon joins two related independent clauses. Master its use for Band 8+ punctuation.',
                        questions: [
                            { instruction: 'True or False', question: 'A semicolon can replace a comma before "and".', options: ['True', 'False'], correctAnswer: 'False', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Cohesive Device Essay',
                        prompt: 'Evaluate the importance of cohesive devices in academic writing.',
                        taskType: 'essay',
                        wordLimit: 250,
                        tips: ['Avoid using firstly/secondly entirely in this essay.'],
                        criteria: ['Used at least 6 different advanced cohesive devices']
                    }
                }
            },
            {
                dayNumber: 9,
                title: 'Task 1: Line Graphs & Bar Charts',
                description: 'Vocabulary for describing trends, peaks, troughs, and stability.',
                phase: 'Advanced',
                content: `<h2>Describing Data Trends</h2><p>Words to master: <em>skyrocketed, plummeted, fluctuated wildly, reached a plateau.</em> Always include a clear overall overview summarizing the main trends without specific numbers.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'skyrocket', phonetic: '/ˈskaɪrɒkɪt/', partOfSpeech: 'verb', definition: 'To increase rapidly and suddenly', example: 'House prices skyrocketed between 2010 and 2020.', vietnameseMeaning: 'Tăng vọt' }
                    ],
                    reading: {
                        title: 'Describing Data Trends Like a Band 8 Candidate',
                        passage: 'Task 1 Academic requires candidates to describe visual data in approximately 150 words...',
                        questions: [
                            { question: 'What is required for Band 7+ that many candidates skip?', options: ['A conclusion', 'The overview paragraph', 'Data tables', 'Personal opinions'], correctAnswer: 'The overview paragraph', explanation: 'The passage states "the overview paragraph is crucial."' }
                        ]
                    },
                    listening: {
                        title: 'Data Description Practice',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-1.mp3`,
                        transcript: 'When describing a line graph, always start with the overview...',
                        questions: [
                            { question: 'Which phrases should you NOT use?', options: ['Rose, climbed', 'Went up, went down', 'Surged, plummeted', 'Plateaued, levelled off'], correctAnswer: 'Went up, went down', explanation: "The speaker warns 'Never write \'went up\' or \'went down\'.'" }
                        ]
                    },
                    speaking: {
                        prompt: 'Describe what you think the overall trends might look like for international tourists to Vietnam from 2000 to 2023.',
                        sampleAnswer: 'Based on my knowledge, I would expect the graph to show a steady increase...',
                        tips: ['Use varied trend vocabulary: surge, plummet, fluctuate, plateau'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Comparatives & Superlatives for Data',
                        lesson: 'How to compare categories accurately using "than", "as much as", and "the least".',
                        questions: [
                            { instruction: 'Form comparison', question: 'Category A had twice as ____ as Category B.', correctAnswer: 'much', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Task 1: Line Graph Description',
                        prompt: 'Write a Task 1 report describing a line graph tracking mobile phone sales from 1990 to 2020.',
                        taskType: 'task1',
                        wordLimit: 150,
                        tips: ['Include an overview immediately after the intro.', 'Do not explain WHY data changed.'],
                        criteria: ['Accurate trend vocabulary']
                    }
                }
            },
            {
                dayNumber: 10,
                title: 'Task 1: Maps & Processes',
                description: 'Using the passive voice to describe geographical changes and manufacturing steps.',
                phase: 'Advanced',
                content: `<h2>Maps and Cyclical Processes</h2><p>In process diagrams, the subject is often acted upon. Hence, the passive voice is mandatory (e.g., "The beans are harvested, then they are transported...").</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'adjacent', phonetic: '/əˈdʒeɪsənt/', partOfSpeech: 'adjective', definition: 'Next to or adjoining something', example: 'A new parking lot was built adjacent to the shopping center.', vietnameseMeaning: 'Liền kề' }
                    ],
                    reading: {
                        title: 'Maps and Processes: The Passive Voice Strategy',
                        passage: 'Map and process questions are considered the most challenging Task 1 question types...',
                        questions: [
                            { question: 'Why is the passive voice important for map and process questions?', options: ['It sounds more formal', 'The focus is on what happened, not who did it', 'It is easier to write', 'Examiners prefer it'], correctAnswer: 'The focus is on what happened, not who did it', explanation: 'The passage explains "the passive voice naturally fits because the focus is on what happened rather than who did it."' }
                        ]
                    },
                    listening: {
                        title: 'Map Description Practice Session',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-2.mp3`,
                        transcript: 'Let us practice describing a map. Remember three key rules...',
                        questions: [
                            { question: 'Which voice should you use for maps?', options: ['Active voice', 'Passive voice', 'Both equally', 'Imperative'], correctAnswer: 'Passive voice', explanation: 'The first rule is "use the passive voice."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Describe changes that have occurred in your hometown or neighborhood over the past 10 years.',
                        sampleAnswer: 'Over the past decade, my neighborhood in Ho Chi Minh City has undergone remarkable transformation...',
                        tips: ['Use passive voice: "was built," "was converted," "was demolished"'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Passive Voice Transformations',
                        lesson: 'Transform active descriptions of processes into strong passive sentences.',
                        questions: [
                            { instruction: 'Passive transformation', question: 'Change to passive: They harvest the beans.', correctAnswer: 'The beans are harvested.', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Task 1: Map Description',
                        prompt: 'Write a Task 1 report describing changes to a village from 2000 to the present day.',
                        taskType: 'task1',
                        wordLimit: 150,
                        tips: ['Ensure almost all action verbs are in the passive voice.', 'Organize by location.'],
                        criteria: ['Used directional prepositions correctly']
                    }
                }
            },
            {
                dayNumber: 11,
                title: 'Time Management in the Exam',
                description: 'How to divide your 60 minutes efficiently between Task 1 and Task 2.',
                phase: 'Advanced',
                content: `<h2>The 20/40 Rule</h2><p>Task 2 is worth twice as many points as Task 1. Never spend more than 20 minutes on Task 1. Always leave 3-5 minutes at the end of Task 2 to proofread for silly grammar slips.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'prioritize', phonetic: '/praɪˈɒrɪtaɪz/', partOfSpeech: 'verb', definition: 'To designate as more important', example: 'You should prioritize Task 2 as it carries more weight.', vietnameseMeaning: 'Ưu tiên' }
                    ],
                    reading: {
                        title: 'The 20/40 Time Strategy',
                        passage: 'Time management is perhaps the most underrated skill in IELTS Writing...',
                        questions: [
                            { question: 'What percentage of marks does Task 2 account for?', options: ['33%', '50%', '66%', '75%'], correctAnswer: '66%', explanation: 'The passage states "Task 2 is worth twice as many marks as Task 1 (66% vs 33%)."' }
                        ]
                    },
                    listening: {
                        title: 'Time Management Tips from an IELTS Trainer',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-3.mp3`,
                        transcript: 'Here is my golden rule for time management. Write Task 2 first...',
                        questions: [
                            { question: 'What is the speaker\'s golden rule?', options: ['Write faster', 'Write Task 2 first', 'Skip Task 1', 'Use a timer'], correctAnswer: 'Write Task 2 first', explanation: 'The golden rule is "Write Task 2 first."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Describe your current time management strategy for studying or working.',
                        sampleAnswer: 'Currently, I allocate approximately two hours each evening...',
                        tips: ['Describe your routine with specific time allocations'],
                        durationSeconds: 90
                    },
                    grammar: {
                        title: 'Error Correction Practice',
                        lesson: 'Learn how to quickly proofread for common errors like subject-verb agreement.',
                        questions: [
                            { instruction: 'Spot the error', question: 'He have many ideas.', correctAnswer: 'has', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Timed Writing Practice',
                        prompt: 'Under strict timing, write a 250-word essay about fast food in schools.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Spend NO MORE than 35 minutes writing.', 'Leave 5 full minutes for proofreading.'],
                        criteria: ['Completed word count within time limit']
                    }
                }
            },
            {
                dayNumber: 12,
                title: 'Analyzing Band 9 Essays',
                description: 'Deconstructing what makes a perfect score.',
                phase: 'Advanced',
                content: `<h2>Band 9 Analysis</h2><p>Read the provided sample essays and note how the author integrates complex grammar effortlessly without sounding unnatural or "forced."</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'impeccable', phonetic: '/ɪmˈpekəbəl/', partOfSpeech: 'adjective', definition: 'Faultless; flawless', example: 'Band 9 essays demonstrate impeccable grammar and vocabulary use.', vietnameseMeaning: 'Hoàn hảo' }
                    ],
                    reading: {
                        title: 'What Makes a Band 9 Essay',
                        passage: 'Achieving Band 9 in IELTS Writing is extremely rare — fewer than 0.1% of candidates worldwide receive this score...',
                        questions: [
                            { question: 'What makes Band 9 vocabulary different from lower bands?', options: ['Using the longest words possible', 'Using precisely the right word in every context', 'Using only academic words', 'Using words from memorized lists'], correctAnswer: 'Using precisely the right word in every context', explanation: 'Band 9 vocabulary is about "using precisely the right word in every context."' }
                        ]
                    },
                    listening: {
                        title: 'Band 9 Essay Deconstruction',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-4.mp3`,
                        transcript: 'The secret to Band 9 is not sophistication for its own sake. It is clarity...',
                        questions: [
                            { question: 'What was true about every sentence in the best essays?', options: ['They were all complex', 'Every sentence served a purpose', 'They were very long', 'They contained rare vocabulary'], correctAnswer: 'Every sentence served a purpose', explanation: 'The speaker says "every sentence served a purpose."' }
                        ]
                    },
                    speaking: {
                        prompt: 'What qualities do you think make an excellent piece of writing in any language?',
                        sampleAnswer: 'In my opinion, the hallmark of excellent writing is clarity of expression...',
                        tips: ['Use sophisticated vocabulary naturally'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Style & Register',
                        lesson: 'Understand the exact appropriate level of formality required for academic essays.',
                        questions: [
                            { instruction: 'Formality check', question: 'Which is more formal? A) A lot of B) A substantial proportion of', options: ['A', 'B'], correctAnswer: 'B', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Band 9 Analysis Essay',
                        prompt: 'Analyze a provided Band 9 essay and summarize its strengths.',
                        taskType: 'essay',
                        wordLimit: 200,
                        tips: ['Look closely at how the author uses grammatical transitions.', 'Notice the precise adjectives used.'],
                        criteria: ['Identified advanced structures correctly']
                    }
                }
            },
            {
                dayNumber: 13,
                title: 'Full Writing Mock Test',
                description: 'Simulate real exam conditions with timed Task 1 and Task 2.',
                phase: 'Mock Test',
                content: `<h2>Mock Test Day</h2><p>Navigate to the <b>Official IELTS Simulations</b> tab in the Exams section and complete the Writing Module strictly under timer conditions.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'simulate', phonetic: '/ˈsɪmjʊleɪt/', partOfSpeech: 'verb', definition: 'To imitate the conditions of a situation', example: 'Today we simulate actual exam conditions to build test readiness.', vietnameseMeaning: 'Mô phỏng' }
                    ],
                    reading: {
                        title: 'Mock Test Preparation Guide',
                        passage: 'Taking mock tests under realistic conditions is the single most effective way to prepare...',
                        questions: [
                            { question: 'How much higher do candidates score who take mock tests?', options: ['0.25 bands', '0.5 bands', '1.0 bands', '1.5 bands'], correctAnswer: '0.5 bands', explanation: 'Research shows they "score an average of 0.5 bands higher."' }
                        ]
                    },
                    listening: {
                        title: 'Mock Test Debrief Session',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-1.mp3`,
                        transcript: 'After your mock test, review your essay with fresh eyes — ideally the next day...',
                        questions: [
                            { question: 'When should you review your mock test essay?', options: ['Immediately after', 'Ideally the next day', 'A week later', 'Never'], correctAnswer: 'Ideally the next day', explanation: 'The speaker says "review your essay with fresh eyes — ideally the next day."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Reflect on your IELTS writing preparation journey so far.',
                        sampleAnswer: 'The most significant challenge I have faced...',
                        tips: ['Be honest about your challenges'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Common Error Patterns',
                        lesson: 'Common grammatical mistakes test-takers make under pressure.',
                        questions: [
                            { instruction: 'True or False', question: 'Stress causes most grammatical errors in mock tests.', options: ['True', 'False'], correctAnswer: 'True', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Full Mock Task 2',
                        prompt: 'Write a full Task 2 essay based on a randomized prompt under timed conditions.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: ['Focus entirely on Task Response.'],
                        criteria: ['Simulated exam effectively']
                    }
                }
            },
            {
                dayNumber: 14,
                title: 'Final Strategy & Exam Readiness',
                description: 'Preparing your mind for test day — last review and confidence building.',
                phase: 'Mock Test',
                content: `<h2>Test Day Readiness</h2><p>Ensure you sleep well. Do not try to memorize new vocabulary the night before. Trust your training and the frameworks you have built over these 14 days.</p>`,
                tasks: {
                    vocabulary: [
                        { word: 'consolidate', phonetic: '/kənˈsɒlɪdeɪt/', partOfSpeech: 'verb', definition: 'To strengthen or make more secure', example: 'Today we consolidate everything learned over the past 14 days.', vietnameseMeaning: 'Củng cố' }
                    ],
                    reading: {
                        title: 'Test Day: What to Expect and How to Succeed',
                        passage: 'Test day can be stressful even for well-prepared candidates...',
                        questions: [
                            { question: 'What should you avoid on the night before the exam?', options: ['Sleeping early', 'Eating dinner', 'Studying new material', 'Reviewing your error log'], correctAnswer: 'Studying new material', explanation: 'The passage advises "avoid studying new material."' }
                        ]
                    },
                    listening: {
                        title: 'Final Words of Encouragement',
                        audioUrl: `${LISTENING_BASE}/SoundHelix-Song-2.mp3`,
                        transcript: 'Congratulations on completing this 14-day masterclass...',
                        questions: [
                            { question: 'What should you do before starting to write?', options: ['Write immediately', 'Plan for 5 minutes', 'Review vocabulary', 'Read other candidates\' work'], correctAnswer: 'Plan for 5 minutes', explanation: 'The speaker advises "plan for 5 minutes."' }
                        ]
                    },
                    speaking: {
                        prompt: 'Imagine it is the day before your IELTS exam. Give a motivational speech to yourself...',
                        sampleAnswer: 'Tomorrow is my IELTS exam, and I feel well-prepared...',
                        tips: ['Speak naturally as if talking to yourself'],
                        durationSeconds: 120
                    },
                    grammar: {
                        title: 'Final Grammar Review',
                        lesson: 'A quick 10-minute check of your biggest historical grammar weaknesses.',
                        questions: [
                            { instruction: 'Review', question: 'I ______ (study) English for 5 years.', correctAnswer: 'have studied', type: 'fill-in' }
                        ]
                    },
                    writing: {
                        title: 'Final Mock Task 1 + 2',
                        prompt: 'Complete both Task 1 and Task 2 back to back strictly in 60 mins.',
                        taskType: 'essay',
                        wordLimit: 400,
                        tips: ['Breathe.', 'Trust your structures.'],
                        criteria: ['Ready for the real thing!']
                    }
                }
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
