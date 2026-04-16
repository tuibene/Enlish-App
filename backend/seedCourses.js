require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const connectDB = require('./src/config/db');

const seedCourses = async () => {
    try {
        await connectDB();
        await Course.deleteMany();

        console.log('Cleared existing courses');

        const ieltsCourse = {
            title: 'IELTS Intensive 30-Day Sprint',
            description: 'Achieve a 7.0+ score by focusing on writing strategies, advanced reading techniques, and intensive speaking mock tests. Designed for intermediate learners ready for the final push.',
            targetType: 'IELTS',
            durationDays: 30,
            level: 'Upper Intermediate',
            image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1000',
            days: []
        };

        // Generate 30 Days of mock content
        for (let i = 1; i <= 30; i++) {
            let topic, desc;
            if (i <= 7) {
                topic = `Week 1: Foundations - Reading Matching Headings`;
                desc = `Learn how to skim passages quickly and identify main ideas without reading every word. Practice with 3 passages today.`;
            } else if (i <= 14) {
                topic = `Week 2: Writing Task 1 Data Interpretation`;
                desc = `Focus on Bar Charts and Line Graphs. Use comparatives and superlatives accurately.`;
            } else if (i <= 21) {
                topic = `Week 3: Advanced Speaking Part 2 & 3`;
                desc = `Building 2-minute monologues using the PPF (Past, Present, Future) strategy.`;
            } else {
                topic = `Week 4: Mock Tests & Listening Trick Questions`;
                desc = `Full-length mock tests under timed conditions. Focus on Map labeling and multiple choice in Section 3/4.`;
            }

            ieltsCourse.days.push({
                dayNumber: i,
                title: `Day ${i}: ${topic}`,
                description: desc,
                content: `<h2>Welcome to Day ${i}</h2><p>Today’s focus is essential for your band score target. Make sure you sit in a quiet room.</p><ul><li>Step 1: Read the strategy guide.</li><li>Step 2: Complete the practice exercises.</li><li>Step 3: Review your mistakes.</li></ul><br/><p>Keep pushing! Consistency is the key to IELTS success.</p>`,
            });
        }

        const toeicCourse = {
            title: 'TOEIC 800+ Mastery Pathway',
            description: 'A structured 30-day program designed to maximize your TOEIC Listening & Reading score through targeted grammar rules and vocabulary acquisition.',
            targetType: 'TOEIC',
            durationDays: 30,
            level: 'Intermediate',
            image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=1000',
            days: []
        };

        for (let i = 1; i <= 30; i++) {
            toeicCourse.days.push({
                dayNumber: i,
                title: `Day ${i}: TOEIC Strategies`,
                description: `Focus on Part ${i % 7 + 1} specific tactics today.`,
                content: `<h2>TOEIC Day ${i}</h2><p>Review essential business vocabulary and practice listening for synonyms.</p>`
            });
        }

        await Course.insertMany([ieltsCourse, toeicCourse]);

        console.log('✅ Courses seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedCourses();
