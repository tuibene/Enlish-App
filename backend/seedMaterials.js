const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Material = require('./src/models/Material');
const User = require('./src/models/User');

dotenv.config();

const seedMaterials = async () => {
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

        await Material.deleteMany();
        console.log('Old materials deleted.');

        const materials = [
            {
                title: 'Essential IELTS Vocabulary: Education',
                description: 'A comprehensive list of vocabulary and collocations related to the topic of Education for IELTS Writing and Speaking.',
                pdfUrl: '',
                content: `
# IELTS Target Vocabulary - Education

Education is one of the most frequent topics in both the IELTS academic writing and speaking exams. Here is a curated list of advanced terminology.

### 1. Tertiary Education
- **Definition:** Education at a college or university level.
- **Example:** Currently, a significant proportion of school leavers choose to pursue *tertiary education* rather than enter the workforce immediately.

### 2. Comprehensive Education
- **Definition:** A system of education that accepts all students regardless of academic ability.
- **Example:** Some argue that *comprehensive education* prevents segregation based on academic merit.

### 3. Rote Learning
- **Definition:** Learning by repetition and memorization, without necessarily understanding the concepts.
- **Example:** Traditional teaching methods often rely heavily on *rote learning*, which can stifle creativity.

### 4. Extra-curricular Activities
- **Definition:** Activities that fall outside the realm of the normal curriculum of school or university education.
- **Example:** Participating in *extra-curricular activities* helps students develop soft skills such as teamwork and leadership.

## Phrasal Verbs
- **To fall behind:** To fail to do something fast enough or on time. (*e.g., He fell behind in his studies due to illness.*)
- **To brush up on:** To improve one's knowledge of something already learned. (*e.g., I need to brush up on my French before visiting Paris.*)
                `,
                type: 'VOCABULARY',
                tags: ['ielts', 'vocabulary', 'education'],
                createdBy: adminUser._id
            },
            {
                title: 'Advanced Grammar: Mixed Conditionals',
                description: 'Master how to mix second and third conditional sentences to express complex past-present unreal situations.',
                pdfUrl: '',
                content: `
# Mixed Conditionals

Conditionals are essential for achieving a high grammatical range score. "Mixed conditionals" are used when the time in the *if-clause* is not the same as the time in the *main clause*.

## Type 1: Past condition with a present result

**Form:** \`If + Past Perfect | would + base verb\`

Used to talk about a past event that has an effect on the present.

- *Example 1:* If I had studied harder at school (past), I would have a better job now (present).
- *Example 2:* If we hadn't missed the flight (past), we would be lying on the beach right now (present).

## Type 2: Present condition with a past result

**Form:** \`If + Past Simple | would have + past participle\`

Used to talk about a present, ongoing situation or a general truth that affected a past event.

- *Example 1:* If I were a stronger swimmer (present/general truth), I would have rescued him (past).
- *Example 2:* If she wasn't so afraid of flying (present continuous trait), she would have traveled to Australia with us last year (past).

## Practice Exercise
Try making your own mixed conditional sentence using these prompts:
1. I didn't eat breakfast (past). I am hungry now (present). -> *If...*
2. I don't speak Spanish (present). I didn't get the job in Madrid (past). -> *If...*
                `,
                type: 'GRAMMAR',
                tags: ['grammar', 'advanced', 'conditionals'],
                createdBy: adminUser._id
            },
            {
                title: 'TOEIC Vocabulary: Office Phrasal Verbs',
                description: '10 phrasal verbs you will encounter daily in a corporate environment.',
                pdfUrl: '',
                content: `
# Corporate Phrasal Verbs

Mastering these will significantly boost your TOEIC Listening and Reading scores!

1. **Draw up** (a contract / document) - To prepare a written document.
2. **Lay off** (staff/employees) - To stop employing someone, usually because there is no work.
3. **Step down** (from a position) - To resign from a high-level position.
4. **Take over** (a company) - To gain control of a company.
5. **Phase out** (a product) - To gradually stop using or selling something.

Review these terms using flashcards for better retention!
                `,
                type: 'VOCABULARY',
                tags: ['toeic', 'vocabulary', 'business'],
                createdBy: adminUser._id
            }
        ];

        await Material.insertMany(materials);
        console.log('Mock materials populated successfully!');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedMaterials();
