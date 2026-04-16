const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('../models/Exam');
const User = require('../models/User');

// Use env from cwd
dotenv.config();

const seedExams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let admin = await User.findOne({ role: 'ADMIN' });
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@engprep.com',
                password: 'password123',
                role: 'ADMIN'
            });
        }

        const exams = [
            {
                title: 'Sample IELTS Reading Test 1',
                type: 'IELTS',
                description: 'A comprehensive reading test designed to simulate the IELTS Academic reading section.',
                createdBy: admin._id,
                questions: [
                    { text: 'What is the synonym of "Ubiquitous"?', options: ['Rare', 'Everywhere', 'Expensive', 'Hidden'], correctAnswerIndex: 1, points: 1 },
                    { text: 'Which word describes a person who loves reading?', options: ['Bibliophile', 'Philanthropist', 'Misanthrope', 'Optimist'], correctAnswerIndex: 0, points: 1 }
                ]
            },
            {
                title: 'Sample TOEIC Listening & Reading',
                type: 'TOEIC',
                description: 'Short TOEIC practice questions.',
                createdBy: admin._id,
                questions: [
                    { questionType: 'MULTIPLE_CHOICE', text: 'The new policy will be implemented ______ the end of the month.', options: ['at', 'on', 'in', 'by'], correctAnswerIndex: 3, points: 1 },
                    { questionType: 'MULTIPLE_CHOICE', text: 'Please ______ the attached file for your reference.', options: ['find', 'look', 'see', 'watch'], correctAnswerIndex: 0, points: 1 }
                ]
            },
            {
                title: 'IELTS Academic Writing Task 2 (Mock)',
                type: 'IELTS',
                description: 'A 40-minute writing task evaluating grammar, vocabulary, and coherence.',
                createdBy: admin._id,
                questions: [
                    {
                        questionType: 'WRITING',
                        text: 'Some people think that strict punishments for driving offences are the key to reducing traffic accidents. Others, however, believe that other measures would be more effective. Discuss both these views and give your own opinion. (Write at least 250 words)',
                        options: [],
                        points: 10
                    }
                ]
            }
        ];

        await Exam.deleteMany({});
        await Exam.insertMany(exams);

        console.log('Sample Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedExams();
