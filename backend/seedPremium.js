const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        
        const newCourse = new Course({
            title: 'IELTS Writing 7.5+ Masterclass',
            description: 'A premium, in-depth course specifically targeting advanced IELTS Writing methodologies, lexical resource enhancement, and coherence strategies.',
            targetType: 'IELTS',
            durationDays: 14,
            level: 'Advanced',
            isPremium: true,
            price: 599000,
            image: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&q=80',
            days: []
        });

        await newCourse.save();
        console.log('Successfully seeded Premium Course!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
