const mongoose = require('mongoose');
const dotenv = require('dotenv');
const OfficialMockExam = require('./src/models/OfficialMockExam');
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

const ieltsMockData = [
{
    title: 'IELTS Academic Mock Test Vol. 1',
    description: 'Experience the exact CBT software format with real 4-skills testing.',
    readingText: `You should spend about 20 minutes on Questions 1-5, which are based on Reading Passage 1 below.

The History of the Bicycle

The bicycle is one of the most ubiquitous forms of transport in the world, yet its history is a complex tale of innovation, failed experiments, and societal impact. Before the invention of the bicycle as we know it, humans relied primarily on walking or animal-drawn vehicles for overland travel. 

The first verifiable claim for a practically used bicycle belongs to the German Baron Karl von Drais, a civil servant to the Grand Duke of Baden in Germany. Drais invented his 'Laufmaschine' (running machine) in 1817. It was known by many names, including the velocipede, hobby-horse, and draisine, and was made almost entirely of wood. The rider straddled the wooden frame and pushed along the ground with their feet, while steering with the front wheel. Although it enjoyed a brief period of popularity, its lack of pedals made it impractical for long journeys or uneven terrain.

The next major leap forward occurred in the 1860s in France, where Pierre Michaux and Pierre Lallement attached pedals directly to the front wheel of a velocipede. This invention, often referred to as the 'boneshaker' due to its stiff wrought-iron frame and wooden wheels surrounded by iron tires, provided a notoriously jarring ride over the cobblestone streets of the era. Despite its discomfort, the boneshaker sparked a craze, particularly in Western Europe and the United States.

In an effort to increase speed, inventors began enlarging the front wheel to which the pedals were attached. This led to the iconic 'penny-farthing' or 'ordinary' bicycle in the 1870s. The penny-farthing was fast but dangerous; the rider sat high above the center of gravity, making headers (falling over the handlebars) a common and perilous occurrence. Therefore, it was primarily a pastime for athletic young men rather than a practical mode of transport for the masses.

The definitive step towards the modern bicycle was the development of the 'safety bicycle' in the late 1880s. John Kemp Starley's Rover, introduced in 1885, featured wheels of equal size, a chain-driven rear wheel, and a diamond-shaped frame. The subsequent addition of John Boyd Dunlop's pneumatic (air-filled) tire in 1888 transformed the bicycle from an uncomfortable and dangerous novelty into a smooth-riding, practical vehicle for everyone. The safety bicycle triggered a massive boom in the 1890s, fundamentally changing society by providing affordable, independent mobility for both men and women, thus playing a significant role in the women's emancipation movement.`,
    writingPrompt1: `You should spend about 20 minutes on this task.
The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017.
Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.`,
    writingPrompt2: `You should spend about 40 minutes on this task.
In many countries today, people in cities either live alone or in small family units, rather than in large, extended family groups. Is this a positive or negative trend?
Give reasons for your answer and include any relevant examples from your own knowledge or experience.
Write at least 250 words.`,
    speakingPrompts: [
        "Part 1: Let's talk about your hometown. Has your hometown changed much since you were a child?",
        "Part 2: Describe a memorable journey you have made. You should have 1 minute to prepare.",
        "Part 3: Do you think public transport will improve in the future? Why or why not?"
    ],
    listeningLecture: {
        title: "Biology Lecture Notes",
        topics: ["micro ecosystems", "distinct insect species", "vital sanctuary"]
    }
},
{
    title: 'IELTS Academic Mock Test Vol. 2',
    description: 'Official test simulation including the latest 2026 examination structure.',
    readingText: `You should spend about 20 minutes on Questions 1-5, which are based on Reading Passage 2 below.

The Rise of Artificial Intelligence in Medicine

Artificial intelligence (AI) is rapidly transforming the landscape of modern medicine. From diagnostic imaging to personalized treatment plans, machine learning algorithms are proving to be invaluable tools for healthcare professionals.

In radiology, AI systems have demonstrated the ability to detect anomalies in X-rays, MRIs, and CT scans with a level of accuracy that rivals, and sometimes surpasses, human experts. These algorithms can quickly analyze thousands of images, identifying subtle patterns indicative of conditions like pneumonia, tumors, or fractures that might be missed by the naked eye. This not only drastically reduces the time required for diagnosis but also helps in early detection, significantly improving patient prognosis.

Beyond diagnostics, AI is making significant strides in drug discovery. Traditionally, bringing a new drug to market can take over a decade and cost billions of dollars. AI expedites this process by predicting how different chemical compounds will interact with specific biological targets. By simulating millions of interactions virtually, researchers can identify promising drug candidates much faster than through conventional laboratory methods.

However, the integration of AI into healthcare is not without challenges. Data privacy remains a paramount concern, as training these algorithms requires vast amounts of sensitive patient data. Furthermore, there is the "black box" problem where an AI's decision-making process is so complex that it is difficult for doctors to understand how a particular diagnosis or recommendation was reached. This lack of transparency can hinder trust and raises ethical questions concerning liability and accountability in cases of misdiagnosis.

Despite these hurdles, the consensus among medical experts is that AI will be an indispensable part of future healthcare. It is not intended to replace doctors, but rather to augment their capabilities, handle repetitive tasks, and provide them with data-driven insights to make more informed clinical decisions.`,
    writingPrompt1: `You should spend about 20 minutes on this task.
The table below shows the proportion of different categories of families living in poverty in Australia in 1999.
Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.`,
    writingPrompt2: `You should spend about 40 minutes on this task.
Some people believe that the best way to improve road safety is to increase the minimum legal age for driving cars or riding motorbikes.
To what extent do you agree or disagree?
Write at least 250 words.`,
    speakingPrompts: [
        "Part 1: Let's talk about food. What is your favorite type of food and why?",
        "Part 2: Describe a restaurant that you enjoyed visiting. You should have 1 minute to prepare.",
        "Part 3: How has people's diet changed in your country over the last few decades?"
    ],
    listeningLecture: {
        title: "History of Architecture",
        topics: ["ancient structures", "building materials", "passive cooling"]
    }
},
{
    title: 'IELTS Academic Mock Test Vol. 3',
    description: 'Challenging set focusing on rare vocabularies for high target band scores.',
    readingText: `You should spend about 20 minutes on Questions 1-5, which are based on Reading Passage 3 below.

The Mystery of the Voynich Manuscript

The Voynich manuscript is a heavily illustrated, handwritten coder-like book from the 15th century. It is named after Wilfrid Voynich, a Polish book dealer who purchased it in 1912. To this day, it remains one of the greatest unsolved mysteries in the history of cryptography and linguistics.

The manuscript consists of approximately 240 vellum pages, although some are missing. It is written from left to right in an unknown alphabet and an unknown language, which linguists have dubbed 'Voynichese'. The text is accompanied by intricate, often bizarre illustrations that seemingly divide the book into several sections: botanical, astronomical, biological, cosmological, and pharmaceutical.

For over a century, professional and amateur cryptographers, including top codebreakers from both World War I and World War II, have attempted to decipher the manuscript. All have failed. The statistical properties of the text, however, suggest that it is not random gibberish. The word frequencies conform to Zipf's law, a linguistic pattern found in all natural languages. This has led many scholars to believe that the manuscript contains a meaningful text, perhaps written in a lost language, a constructed language, or a complex cipher.

Various theories have been proposed regarding its origin and purpose. Some suggest it was an elaborate hoax created to extort money from royalty or wealthy collectors. Others theorize it could be a secret medical or alchemical text, deliberately obscured to protect valuable knowledge from the uninitiated or the Inquisition. Radiocarbon dating of the vellum places its creation between 1404 and 1438, which refutes some theories of modern forgery but deepens the historical enigma.

Recent advancements in computer science and artificial intelligence have been applied to the manuscript with varying degrees of success. Machine learning algorithms have suggested potential linguistic matches for the text, such as Hebrew or an extinct Romance dialect. Yet, definitive translation remains elusive. The Voynich manuscript continues to captivate scholars and the public alike, a tantalizing puzzle that resists all attempts to unlock its secrets.`,
    writingPrompt1: `You should spend about 20 minutes on this task.
The diagrams show a structure that is used to generate electricity from wave power.
Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.`,
    writingPrompt2: `You should spend about 40 minutes on this task.
Nowadays, more and more older people who need employment have to compete with younger people for the same jobs.
What problems does this cause? What are some possible solutions?
Write at least 250 words.`,
    speakingPrompts: [
        "Part 1: Let's discuss technology. How often do you use social media?",
        "Part 2: Describe an app or software program you use frequently. You should have 1 minute to prepare.",
        "Part 3: In what ways do you think technology has negatively impacted human communication?"
    ],
    listeningLecture: {
        title: "Future of Space Travel",
        topics: ["commercial flights", "fuel source", "microgravity"]
    }
}
];

const seedExams = async () => {
    try {
        await connectDB();

        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (!adminUser) {
            console.error('No ADMIN user found! Cannot create exams without an author.');
            process.exit(1);
        }

        // Wipe existing official mocks
        await OfficialMockExam.deleteMany({});
        
        // Insert new ones
        const examsToInsert = ieltsMockData.map(exam => ({
            ...exam,
            createdBy: adminUser._id,
            isActive: true
        }));

        const createdExams = await OfficialMockExam.insertMany(examsToInsert);
        console.log(`Successfully added ${createdExams.length} Official Mock exams!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding exams:', error);
        process.exit(1);
    }
};

seedExams();
