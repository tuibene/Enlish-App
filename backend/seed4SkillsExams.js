const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('./src/models/Exam');
const User = require('./src/models/User');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedExams = async () => {
    try {
        await connectDB();

        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (!adminUser) {
            console.error('No ADMIN user found! Cannot create exams without an author.');
            process.exit(1);
        }

        const examsData = [
            {
                title: 'IELTS Academic Full Test Vol. 2 (4 Skills)',
                type: 'IELTS',
                description: 'A comprehensive IELTS Academic mock test covering Listening, Reading, Writing, and Speaking skills, complete with AI automated assessment.',
                createdBy: adminUser._id,
                isActive: true,
                questions: [
                    {
                        questionType: 'MULTIPLE_CHOICE',
                        text: 'Reading Part 1: What is the primary cause of coral bleaching?',
                        options: ['Overfishing', 'Rising ocean temperatures', 'Oil spills', 'Plastic pollution'],
                        correctAnswerIndex: 1,
                        points: 1
                    },
                    {
                        questionType: 'WRITING',
                        text: 'Writing Task 2: Some people believe that university education should be free for everyone. To what extent do you agree or disagree?',
                        points: 5
                    }
                ]
            },
            {
                title: 'The Ultimate TOEIC 4-Skills Challenge',
                type: 'TOEIC',
                description: 'An advanced full-length TOEIC preparation exam simulating both the R&L and S&W modules to guarantee a 900+ score.',
                createdBy: adminUser._id,
                isActive: true,
                questions: [
                    {
                        questionType: 'MULTIPLE_CHOICE',
                        text: 'Q1: The CEO requested that all department heads _____ their quarterly reports by Friday.',
                        options: ['submits', 'submitting', 'submit', 'submitted'],
                        correctAnswerIndex: 2,
                        points: 1
                    }
                ]
            },
            {
                title: 'IELTS General Training 4 Skills Evaluation',
                type: 'IELTS',
                description: 'Specifically tailored for immigration purposes. Test your everyday English reading, writing, and conversational speaking skills.',
                createdBy: adminUser._id,
                isActive: true,
                questions: [
                    {
                        questionType: 'WRITING',
                        text: 'Writing Task 1: Write a letter to your landlord complaining about a broken heater.',
                        points: 3
                    }
                ]
            },
            {
                title: 'Cambridge C1 Advanced (CAE) Simulator',
                type: 'General',
                description: 'A robust CEFR C1-level test assessing Use of English, Listening, Speaking, and formal essay writing.',
                createdBy: adminUser._id,
                isActive: true,
                questions: [
                    {
                        questionType: 'MULTIPLE_CHOICE',
                        text: 'Which sentence demonstrates correct inversion?',
                        options: ['Never I have seen such a beautiful sunset.', 'Never have I seen such a beautiful sunset.', 'I have never seen such beautiful sunset.', 'Never I saw such a sunset before.'],
                        correctAnswerIndex: 1,
                        points: 1
                    }
                ]
            }
        ];

        console.log('Inserting 4-skills complex exams into the DB...');
        const createdExams = await Exam.insertMany(examsData);
        console.log(`Successfully added ${createdExams.length} comprehensive 4-skills exams!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding exams:', error);
        process.exit(1);
    }
};

seedExams();
