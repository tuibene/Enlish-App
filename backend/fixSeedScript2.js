const fs = require('fs');

const fileContent = fs.readFileSync('seedPremiumContent.js', 'utf8');

let newContent = fileContent
    .replace(/type: 'Task 2'/g, "taskType: 'task2'")
    .replace(/trainerTips:/g, 'tips:')
    .replace(/criteriaChecklist:/g, 'criteria:');

const grammarWritingBlock = (day) => `,
                    grammar: {
                        title: 'Grammar Focus Day ${day}',
                        lesson: 'Important grammar rules and practice for Day ${day}.',
                        questions: [
                            { instruction: 'Choose the correct form', question: 'Please select the right answer.', options: ['A', 'B', 'C'], correctAnswer: 'A', type: 'multiple-choice' }
                        ]
                    },
                    writing: {
                        title: 'Writing Task Day ${day}',
                        prompt: 'Discuss a topic relevant to Day ${day} and give your opinion.',
                        taskType: 'task2',
                        wordLimit: 250,
                        tips: [
                            'Read the prompt carefully.',
                            'Plan your essay.',
                            'Check your work.'
                        ],
                        criteria: [
                            'Task Response',
                            'Coherence and Cohesion',
                            'Lexical Resource',
                            'Grammatical Range and Accuracy'
                        ],
                        modelAnswer: 'A good approach to this topic is...'
                    }`;

const parts = newContent.split('dayNumber: ');
for (let i = 3; i <= 14; i++) {
    // We are looking for the end of the speaking block.
    // Specifically looking for:
    // durationSeconds: 120,
    //                     }
    const speakingEndIndex = parts[i].indexOf('durationSeconds: 120,\n                    }');
    if (speakingEndIndex !== -1) {
        // We append the grammar block after `}` and before the `\n                }` which closes the `tasks` block.
        const insertPosition = speakingEndIndex + 'durationSeconds: 120,\n                    }'.length;
        parts[i] = parts[i].slice(0, insertPosition) + grammarWritingBlock(i) + parts[i].slice(insertPosition);
    }
}
newContent = parts.join('dayNumber: ');

fs.writeFileSync('seedPremiumContent.js', newContent);
console.log('Fixed seedPremiumContent.js');
