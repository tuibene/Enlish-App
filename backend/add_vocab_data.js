const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Material = require('./src/models/Material');
const User = require('./src/models/User');

dotenv.config();

const addVocabData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // Get or create a dummy admin user
        let adminUser = await User.findOne({ email: 'admin@engprep.com' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'EngPrep Admin',
                email: 'admin@engprep.com',
                password: 'password123',
                role: 'ADMIN'
            });
        }

        const newMaterials = [
            {
                title: 'Mastering Travel Vocabulary',
                description: 'Essential phrasal verbs and idioms for travel and tourism, perfect for IELTS Speaking Part 1.',
                pdfUrl: '',
                content: `
# Travel & Tourism Vocabulary

Whether you are planning a trip or preparing for an English exam, these terms are indispensable.

## Phrasal Verbs
- **Check in:** To register at a hotel or airport. (*e.g., We need to check in two hours before the flight.*)
- **Set off:** To start a journey. (*e.g., We set off at dawn to avoid the traffic.*)
- **Get away:** To go on a vacation, often to escape stress. (*e.g., I really need to get away for a few days.*)
- **Stop over:** To stay somewhere for a short time during a long journey. (*e.g., We stopped over in Singapore on our way to Australia.*)

## Idioms
- **Off the beaten track:** A place not frequently visited by tourists. (*e.g., I prefer exploring villages that are off the beaten track.*)
- **Travel light:** To travel with very little luggage. (*e.g., Since we're moving between cities every day, it's best to travel light.*)
- **At the crack of dawn:** Very early in the morning. (*e.g., Our flight leaves at the crack of dawn.*)
                `,
                type: 'VOCABULARY',
                tags: ['travel', 'vocabulary', 'idioms'],
                createdBy: adminUser._id
            },
            {
                title: 'Environment & Ecology: Academic Vocabulary',
                description: 'High-level vocabulary for discussing climate change, sustainability, and ecology in IELTS Writing Task 2.',
                pdfUrl: '',
                content: `
# Environmental Academic Vocabulary

Topic: Sustainability and Climate Change.

### 1. Biodiversity
- **Definition:** The variety of plant and animal life in a particular habitat.
- **Example:** Human activities are a major threat to the *biodiversity* of the Amazon rainforest.

### 2. Sustainablility
- **Definition:** The ability to be maintained at a certain rate or level without depleting natural resources.
- **Example:** Governments must invest more in *sustainability* to ensure the well-being of future generations.

### 3. Carbon Footprint
- **Definition:** The total amount of greenhouse gases produced by an individual, event, or organization.
- **Example:** One of the most effective ways to reduce your *carbon footprint* is to minimize air travel.

### 4. Renewable Energy
- **Definition:** Energy from a source that is not depleted when used, such as wind or solar power.
- **Example:** The transition to *renewable energy* is essential for combating global warming.

## Practice Question
"To what extent should individuals be held responsible for protecting the environment?"
Use at least 3 terms from above in your answer.
                `,
                type: 'VOCABULARY',
                tags: ['environment', 'ielts', 'academic'],
                createdBy: adminUser._id
            },
            {
                title: 'Technology & Innovation: Modern Lexicon',
                description: 'Stay ahead of the curve with keywords related to AI, automation, and digital transformation.',
                pdfUrl: '',
                content: `
# Technology & Innovation Lexicon

The digital landscape is evolving rapidly. Here are the keys to discussing modern technology.

### 1. Artificial Intelligence (AI)
- **Usage:** "AI is revolutionizing the way we approach data analysis and decision-making."

### 2. Automation
- **Usage:** "Many repetitive tasks are now handled through *automation*, allowing human workers to focus on creative roles."

### 3. Cutting-edge
- **Definition:** Extremely modern and advanced.
- **Usage:** "The company is known for its *cutting-edge* research in biotechnology."

### 4. Digital Literacy
- **Definition:** The ability to find, evaluate, and communicate information through various digital platforms.
- **Usage:** "Improving *digital literacy* is crucial for narrowing the socio-economic gap."

### 5. Disruptive Technology
- **Definition:** An innovation that significantly alters the way that consumers, industries, or businesses operate.
- **Usage:** "The internet was a *disruptive technology* that changed the retail industry forever."
                `,
                type: 'VOCABULARY',
                tags: ['technology', 'ai', 'innovation'],
                createdBy: adminUser._id
            }
        ];

        await Material.insertMany(newMaterials);
        console.log('Successfully added new vocabulary data to the database.');

        process.exit();
    } catch (error) {
        console.error('Error adding data:', error);
        process.exit(1);
    }
};

addVocabData();
