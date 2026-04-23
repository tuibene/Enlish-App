const fs = require('fs');

const fileContent = fs.readFileSync('seedPremiumContent.js', 'utf8');

// The file has an array of objects `masterclass.days = [...]`
// It is plain JS, not JSON, so we can't easily JSON.parse it.
// I will just use regex to replace the keys in writing objects
let newContent = fileContent
    .replace(/type: 'Task 2'/g, "taskType: 'task2'")
    .replace(/trainerTips:/g, 'tips:')
    .replace(/criteriaChecklist:/g, 'criteria:');

// Let's also add dummy grammar and writing blocks for days 3-14.
// For each day from 3 to 14, there is a "speaking:" block inside the tasks object.
// I can just match "durationSeconds: 120,\n                    }" and append the grammar and writing blocks.

const grammarWritingBlock = (day) => `
                    },
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

// To avoid replacing Day 1 and 2 which differ, I'll match all day blocks programmatically.
// Actually, reviewing Day 3-14, they all end with:
// durationSeconds: 120,
//                     }
//                 }
//             },

// Let's do a programmatic approach for the file content
// I will split by `dayNumber: ` and modify from index 3 up to 14.

const parts = newContent.split('dayNumber: ');
for (let i = 3; i <= 14; i++) {
    // parts[i] contains the block for day i.
    // I need to find the end of the speaking block.
    const speakingEndIndex = parts[i].indexOf('durationSeconds: 120,\n                    }');
    if (speakingEndIndex !== -1) {
        // The length of 'durationSeconds: 120,\n                    }' is 43 characters
        const insertPosition = speakingEndIndex + 43;
        parts[i] = parts[i].slice(0, insertPosition) + grammarWritingBlock(i) + parts[i].slice(insertPosition);
    }
}
newContent = parts.join('dayNumber: ');

fs.writeFileSync('seedPremiumContent.js', newContent);
console.log('Fixed seedPremiumContent.js');
