require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const connectDB = require('./src/config/db');

// ═══════════════════════════════════════════════════════════════
//  30-Day IELTS Intensive Course — Full Task Data
//  Phase 1: Foundation (Day 1-7)
//  Phase 2: Building (Day 8-14)
//  Phase 3: Advanced (Day 15-21)
//  Phase 4: Mock Test (Day 22-30)
// ═══════════════════════════════════════════════════════════════

const LISTENING_BASE = 'https://www.soundhelix.com/examples/mp3';

function buildDay(dayNum, title, desc, phase, vocab, grammar, reading, listening) {
    return {
        dayNumber: dayNum,
        title,
        description: desc,
        phase,
        content: '',
        tasks: { 
            vocabulary: vocab, 
            grammar, 
            reading, 
            listening 
            // Speaking and Writing are PREMIUM ONLY
        },
    };
}

// ─── GRAMMAR DATA POOL ─────────────────────────────
const grammarPool = [
    {
        title: 'Present Simple vs Present Continuous',
        lesson: 'Use Present Simple for habits and facts. Use Present Continuous for actions happening now.',
        questions: [
            { instruction: 'Choose the correct form', question: 'She ________ (watch) TV every evening.', options: ['watches', 'is watching', 'watch'], correctAnswer: 'watches', type: 'multiple-choice' },
            { instruction: 'Fill in the blank', question: 'Look! It ________ (rain) heavily outside.', correctAnswer: 'is raining', type: 'fill-in', explanation: 'Use present continuous for actions happening at the moment of speaking.' }
        ]
    },
    {
        title: 'Articles: A, An, The',
        lesson: 'Use "a/an" for non-specific nouns. Use "the" for specific or previously mentioned nouns.',
        questions: [
            { instruction: 'Choose the correct article', question: 'I saw ________ amazing movie yesterday.', options: ['a', 'an', 'the'], correctAnswer: 'an', type: 'multiple-choice' },
            { instruction: 'Fill in the blank', question: '________ sun rises in the east.', correctAnswer: 'The', type: 'fill-in' }
        ]
    },
    {
        title: 'Past Simple: Regular & Irregular',
        lesson: 'Past simple describes completed actions in the past.',
        questions: [
            { instruction: 'Choose the correct form', question: 'They ________ (go) to Paris last summer.', options: ['goed', 'went', 'gone'], correctAnswer: 'went', type: 'multiple-choice' },
            { instruction: 'Fill in the blank', question: 'I ________ (finish) my homework two hours ago.', correctAnswer: 'finished', type: 'fill-in' }
        ]
    }
];

// ─── VOCABULARY DATA POOLS (by phase) ────────────────────────
const vocabWeek1 = [
    // Day 1
    [
        { word: 'analyze', phonetic: '/ˈænəlaɪz/', partOfSpeech: 'verb', definition: 'To examine something in detail to understand it better', example: 'Scientists analyze data to find patterns.', vietnameseMeaning: 'Phân tích' },
        { word: 'benefit', phonetic: '/ˈbenɪfɪt/', partOfSpeech: 'noun/verb', definition: 'An advantage or something that helps you', example: 'Regular exercise has many health benefits.', vietnameseMeaning: 'Lợi ích' },
        { word: 'concept', phonetic: '/ˈkɒnsept/', partOfSpeech: 'noun', definition: 'An abstract idea or general notion', example: 'The concept of sustainability is important in modern business.', vietnameseMeaning: 'Khái niệm' },
        { word: 'demonstrate', phonetic: '/ˈdemənstreɪt/', partOfSpeech: 'verb', definition: 'To show or prove something clearly', example: 'The experiment demonstrates the effect of gravity.', vietnameseMeaning: 'Chứng minh, trình bày' },
        { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', partOfSpeech: 'noun', definition: 'The natural world or the conditions in which a person lives', example: 'Pollution has a severe impact on the environment.', vietnameseMeaning: 'Môi trường' },
        { word: 'factor', phonetic: '/ˈfæktər/', partOfSpeech: 'noun', definition: 'A circumstance or element contributing to a result', example: 'Cost is a major factor in this decision.', vietnameseMeaning: 'Yếu tố' },
    ],
    // Day 2
    [
        { word: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', partOfSpeech: 'noun', definition: 'A proposed explanation for something that can be tested', example: 'The scientist tested her hypothesis through experiments.', vietnameseMeaning: 'Giả thuyết' },
        { word: 'impact', phonetic: '/ˈɪmpækt/', partOfSpeech: 'noun/verb', definition: 'A strong effect or influence on something', example: 'Technology has had a huge impact on education.', vietnameseMeaning: 'Tác động' },
        { word: 'justify', phonetic: '/ˈdʒʌstɪfaɪ/', partOfSpeech: 'verb', definition: 'To show or prove to be right or reasonable', example: 'Can you justify your decision with evidence?', vietnameseMeaning: 'Biện minh' },
        { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', partOfSpeech: 'adjective', definition: 'Important or large enough to have an effect', example: 'There has been a significant increase in online learning.', vietnameseMeaning: 'Đáng kể, quan trọng' },
        { word: 'relevant', phonetic: '/ˈreləvənt/', partOfSpeech: 'adjective', definition: 'Closely connected or appropriate to the matter', example: 'Please include only relevant information in your essay.', vietnameseMeaning: 'Liên quan' },
        { word: 'approach', phonetic: '/əˈprəʊtʃ/', partOfSpeech: 'noun/verb', definition: 'A way of dealing with something', example: 'We need a new approach to solve this problem.', vietnameseMeaning: 'Cách tiếp cận' },
    ],
    // Day 3
    [
        { word: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', partOfSpeech: 'noun', definition: 'A result or effect of an action', example: 'One consequence of climate change is rising sea levels.', vietnameseMeaning: 'Hậu quả' },
        { word: 'contribute', phonetic: '/kənˈtrɪbjuːt/', partOfSpeech: 'verb', definition: 'To give something to help achieve a goal', example: 'Education contributes to economic growth.', vietnameseMeaning: 'Đóng góp' },
        { word: 'essential', phonetic: '/ɪˈsenʃəl/', partOfSpeech: 'adjective', definition: 'Absolutely necessary; extremely important', example: 'Water is essential for human survival.', vietnameseMeaning: 'Thiết yếu' },
        { word: 'evidence', phonetic: '/ˈevɪdəns/', partOfSpeech: 'noun', definition: 'Facts or information indicating whether something is true', example: 'There is strong evidence that exercise improves mental health.', vietnameseMeaning: 'Bằng chứng' },
        { word: 'outcome', phonetic: '/ˈaʊtkʌm/', partOfSpeech: 'noun', definition: 'The way a thing turns out; a result', example: 'The outcome of the negotiation was positive for both sides.', vietnameseMeaning: 'Kết quả' },
        { word: 'proportion', phonetic: '/prəˈpɔːʃən/', partOfSpeech: 'noun', definition: 'A part or share of a whole', example: 'A large proportion of students prefer online learning.', vietnameseMeaning: 'Tỷ lệ' },
    ],
    // Day 4
    [
        { word: 'assume', phonetic: '/əˈsjuːm/', partOfSpeech: 'verb', definition: 'To accept something as true without proof', example: 'We cannot assume that the data is accurate.', vietnameseMeaning: 'Giả định' },
        { word: 'criteria', phonetic: '/kraɪˈtɪəriə/', partOfSpeech: 'noun (plural)', definition: 'Standards by which something is judged', example: 'What criteria are used to evaluate the essays?', vietnameseMeaning: 'Tiêu chí' },
        { word: 'predominant', phonetic: '/prɪˈdɒmɪnənt/', partOfSpeech: 'adjective', definition: 'Present as the strongest or main element', example: 'English is the predominant language in international business.', vietnameseMeaning: 'Chiếm ưu thế' },
        { word: 'perspective', phonetic: '/pəˈspektɪv/', partOfSpeech: 'noun', definition: 'A particular attitude or way of considering something', example: 'From a historical perspective, this event was crucial.', vietnameseMeaning: 'Quan điểm, góc nhìn' },
        { word: 'implement', phonetic: '/ˈɪmplɪment/', partOfSpeech: 'verb', definition: 'To put a plan or decision into effect', example: 'The government plans to implement new environmental policies.', vietnameseMeaning: 'Thực hiện, triển khai' },
        { word: 'infrastructure', phonetic: '/ˈɪnfrəstrʌktʃər/', partOfSpeech: 'noun', definition: 'The basic physical systems of a country or organization', example: 'Investment in infrastructure is key to economic development.', vietnameseMeaning: 'Cơ sở hạ tầng' },
    ],
    // Day 5
    [
        { word: 'sustainable', phonetic: '/səˈsteɪnəbəl/', partOfSpeech: 'adjective', definition: 'Able to be maintained at a certain rate or level', example: 'We need sustainable energy sources to protect the environment.', vietnameseMeaning: 'Bền vững' },
        { word: 'phenomenon', phonetic: '/fɪˈnɒmɪnən/', partOfSpeech: 'noun', definition: 'A fact or situation that is observed to exist', example: 'Global warming is a well-documented phenomenon.', vietnameseMeaning: 'Hiện tượng' },
        { word: 'fluctuate', phonetic: '/ˈflʌktʃueɪt/', partOfSpeech: 'verb', definition: 'To rise and fall irregularly in number or amount', example: 'Prices tend to fluctuate based on demand.', vietnameseMeaning: 'Dao động' },
        { word: 'inevitable', phonetic: '/ɪnˈevɪtəbəl/', partOfSpeech: 'adjective', definition: 'Certain to happen; unavoidable', example: 'Technological change is inevitable in modern society.', vietnameseMeaning: 'Không thể tránh khỏi' },
        { word: 'acknowledge', phonetic: '/əkˈnɒlɪdʒ/', partOfSpeech: 'verb', definition: 'To accept or admit the existence of something', example: 'We must acknowledge the challenges facing education today.', vietnameseMeaning: 'Thừa nhận' },
        { word: 'considerable', phonetic: '/kənˈsɪdərəbəl/', partOfSpeech: 'adjective', definition: 'Notably large in size, amount, or extent', example: 'She has considerable experience in teaching English.', vietnameseMeaning: 'Đáng kể' },
    ],
    // Day 6
    [
        { word: 'controversial', phonetic: '/ˌkɒntrəˈvɜːʃəl/', partOfSpeech: 'adjective', definition: 'Giving rise to public disagreement', example: 'Animal testing remains a controversial topic.', vietnameseMeaning: 'Gây tranh cãi' },
        { word: 'deteriorate', phonetic: '/dɪˈtɪəriəreɪt/', partOfSpeech: 'verb', definition: 'To become progressively worse', example: 'Air quality continues to deteriorate in major cities.', vietnameseMeaning: 'Xấu đi, suy thoái' },
        { word: 'widespread', phonetic: '/ˈwaɪdspred/', partOfSpeech: 'adjective', definition: 'Found or distributed over a large area', example: 'Internet access has become widespread in urban areas.', vietnameseMeaning: 'Phổ biến rộng rãi' },
        { word: 'accelerate', phonetic: '/əkˈseləreɪt/', partOfSpeech: 'verb', definition: 'To increase in rate, amount, or extent', example: 'Technology has accelerated the pace of change.', vietnameseMeaning: 'Tăng tốc' },
        { word: 'profound', phonetic: '/prəˈfaʊnd/', partOfSpeech: 'adjective', definition: 'Very great or intense; having deep meaning', example: 'The internet has had a profound effect on communication.', vietnameseMeaning: 'Sâu sắc' },
        { word: 'undergo', phonetic: '/ˌʌndərˈɡoʊ/', partOfSpeech: 'verb', definition: 'To experience or be subjected to something', example: 'The city has undergone significant transformation.', vietnameseMeaning: 'Trải qua' },
    ],
    // Day 7
    [
        { word: 'allocate', phonetic: '/ˈæləkeɪt/', partOfSpeech: 'verb', definition: 'To distribute resources for a particular purpose', example: 'The government should allocate more funds to education.', vietnameseMeaning: 'Phân bổ' },
        { word: 'comprise', phonetic: '/kəmˈpraɪz/', partOfSpeech: 'verb', definition: 'To consist of; be made up of', example: 'The committee comprises five members from different departments.', vietnameseMeaning: 'Bao gồm' },
        { word: 'diminish', phonetic: '/dɪˈmɪnɪʃ/', partOfSpeech: 'verb', definition: 'To make or become less', example: 'The importance of handwriting has diminished in the digital age.', vietnameseMeaning: 'Giảm bớt' },
        { word: 'enhance', phonetic: '/ɪnˈhɑːns/', partOfSpeech: 'verb', definition: 'To increase or improve in quality, value, or extent', example: 'Technology can enhance the learning experience.', vietnameseMeaning: 'Nâng cao' },
        { word: 'predominant', phonetic: '/prɪˈdɒmɪnənt/', partOfSpeech: 'adjective', definition: 'Present as the most important or strongest', example: 'Rice is the predominant crop in Southeast Asia.', vietnameseMeaning: 'Chiếm ưu thế' },
        { word: 'subsequent', phonetic: '/ˈsʌbsɪkwənt/', partOfSpeech: 'adjective', definition: 'Coming after something in time', example: 'The initial study and subsequent research confirmed the findings.', vietnameseMeaning: 'Tiếp theo, sau đó' },
    ],
];

const vocabWeek2 = [
    // Day 8
    [
        { word: 'adversely', phonetic: '/ˈædvɜːsli/', partOfSpeech: 'adverb', definition: 'In a way that is harmful or negative', example: 'Pollution adversely affects public health.', vietnameseMeaning: 'Một cách bất lợi' },
        { word: 'concurrent', phonetic: '/kənˈkʌrənt/', partOfSpeech: 'adjective', definition: 'Existing or happening at the same time', example: 'The two events were concurrent, making it difficult to attend both.', vietnameseMeaning: 'Đồng thời' },
        { word: 'elaborate', phonetic: '/ɪˈlæbərət/', partOfSpeech: 'adjective/verb', definition: 'Involving many carefully arranged parts; to explain in detail', example: 'Could you elaborate on your main argument?', vietnameseMeaning: 'Chi tiết, giải thích kỹ' },
        { word: 'incentive', phonetic: '/ɪnˈsentɪv/', partOfSpeech: 'noun', definition: 'Something that motivates a particular action', example: 'Tax reductions serve as an incentive for businesses.', vietnameseMeaning: 'Động lực, ưu đãi' },
        { word: 'preliminary', phonetic: '/prɪˈlɪmɪnəri/', partOfSpeech: 'adjective', definition: 'Preceding or done in preparation for something', example: 'Preliminary results suggest the treatment is effective.', vietnameseMeaning: 'Sơ bộ' },
        { word: 'scrutinize', phonetic: '/ˈskruːtənaɪz/', partOfSpeech: 'verb', definition: 'To examine or inspect closely and thoroughly', example: 'Researchers scrutinized the data for errors.', vietnameseMeaning: 'Xem xét kỹ lưỡng' },
    ],
    // Day 9
    [
        { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', partOfSpeech: 'adjective', definition: 'Open to more than one interpretation; unclear', example: 'The instructions were ambiguous and caused confusion.', vietnameseMeaning: 'Mơ hồ, không rõ ràng' },
        { word: 'coincide', phonetic: '/ˌkəʊɪnˈsaɪd/', partOfSpeech: 'verb', definition: 'To occur at the same time or place', example: 'The festival coincides with the start of spring.', vietnameseMeaning: 'Trùng hợp' },
        { word: 'dilemma', phonetic: '/dɪˈlemə/', partOfSpeech: 'noun', definition: 'A situation requiring a choice between equally undesirable alternatives', example: 'Many parents face the dilemma of work-life balance.', vietnameseMeaning: 'Tình thế tiến thoái lưỡng nan' },
        { word: 'legitimate', phonetic: '/lɪˈdʒɪtɪmət/', partOfSpeech: 'adjective', definition: 'Conforming to the law or rules; reasonable', example: 'Students have legitimate concerns about tuition fees.', vietnameseMeaning: 'Hợp pháp, chính đáng' },
        { word: 'paradigm', phonetic: '/ˈpærədaɪm/', partOfSpeech: 'noun', definition: 'A typical example or pattern of something; a model', example: 'The internet represents a paradigm shift in communication.', vietnameseMeaning: 'Hệ mẫu, mô hình' },
        { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', partOfSpeech: 'adjective', definition: 'Never done or known before', example: 'The pandemic caused unprecedented disruption to global travel.', vietnameseMeaning: 'Chưa từng có' },
    ],
    // Day 10-14 (abbreviated but with different words)
    [
        { word: 'alleviate', phonetic: '/əˈliːvieɪt/', partOfSpeech: 'verb', definition: 'To make suffering or a problem less severe', example: 'Governments must alleviate poverty in rural areas.', vietnameseMeaning: 'Giảm bớt' },
        { word: 'compelling', phonetic: '/kəmˈpelɪŋ/', partOfSpeech: 'adjective', definition: 'Evoking interest or attention in an irresistible way', example: 'She presented a compelling argument for renewable energy.', vietnameseMeaning: 'Thuyết phục' },
        { word: 'empirical', phonetic: '/ɪmˈpɪrɪkəl/', partOfSpeech: 'adjective', definition: 'Based on observation or experience rather than theory', example: 'The study provides empirical evidence for the hypothesis.', vietnameseMeaning: 'Thực nghiệm' },
        { word: 'misconception', phonetic: '/ˌmɪskənˈsepʃən/', partOfSpeech: 'noun', definition: 'A view or opinion that is incorrect', example: 'A common misconception is that cold weather causes colds.', vietnameseMeaning: 'Quan điểm sai lầm' },
        { word: 'pragmatic', phonetic: '/præɡˈmætɪk/', partOfSpeech: 'adjective', definition: 'Dealing with things sensibly and realistically', example: 'We need a pragmatic approach to solving urban congestion.', vietnameseMeaning: 'Thực dụng' },
        { word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', partOfSpeech: 'adjective', definition: 'Present, appearing, or found everywhere', example: 'Smartphones have become ubiquitous in modern society.', vietnameseMeaning: 'Có mặt ở khắp nơi' },
    ],
    [
        { word: 'advocate', phonetic: '/ˈædvəkeɪt/', partOfSpeech: 'verb/noun', definition: 'To publicly support or recommend a cause', example: 'Many educators advocate for technology in classrooms.', vietnameseMeaning: 'Ủng hộ, người ủng hộ' },
        { word: 'constraints', phonetic: '/kənˈstreɪnts/', partOfSpeech: 'noun', definition: 'Limitations or restrictions', example: 'Budget constraints prevent us from hiring more staff.', vietnameseMeaning: 'Hạn chế, ràng buộc' },
        { word: 'detrimental', phonetic: '/ˌdetrɪˈmentəl/', partOfSpeech: 'adjective', definition: 'Tending to cause harm', example: 'Excessive screen time can be detrimental to children\'s development.', vietnameseMeaning: 'Có hại' },
        { word: 'exacerbate', phonetic: '/ɪɡˈzæsərbeɪt/', partOfSpeech: 'verb', definition: 'To make a problem or situation worse', example: 'Lack of funding will exacerbate the housing crisis.', vietnameseMeaning: 'Làm trầm trọng hơn' },
        { word: 'inherent', phonetic: '/ɪnˈhɪərənt/', partOfSpeech: 'adjective', definition: 'Existing as a permanent, essential quality', example: 'There are inherent risks in any investment.', vietnameseMeaning: 'Vốn có, cố hữu' },
        { word: 'mitigate', phonetic: '/ˈmɪtɪɡeɪt/', partOfSpeech: 'verb', definition: 'To make less severe or serious', example: 'Planting trees can help mitigate the effects of flooding.', vietnameseMeaning: 'Giảm nhẹ' },
    ],
    [
        { word: 'nonetheless', phonetic: '/ˌnʌnðəˈles/', partOfSpeech: 'adverb', definition: 'In spite of that; nevertheless', example: 'The task was difficult; nonetheless, they completed it on time.', vietnameseMeaning: 'Tuy nhiên' },
        { word: 'perceive', phonetic: '/pəˈsiːv/', partOfSpeech: 'verb', definition: 'To become aware of through the senses or mind', example: 'Many people perceive AI as a threat to traditional jobs.', vietnameseMeaning: 'Nhận thức, cảm nhận' },
        { word: 'superficial', phonetic: '/ˌsuːpəˈfɪʃəl/', partOfSpeech: 'adjective', definition: 'Existing or occurring at or on the surface; not thorough', example: 'A superficial reading of the data might be misleading.', vietnameseMeaning: 'Hời hợt, bề ngoài' },
        { word: 'tangible', phonetic: '/ˈtændʒɪbəl/', partOfSpeech: 'adjective', definition: 'Clear and definite; real', example: 'There has been no tangible improvement in air quality.', vietnameseMeaning: 'Hữu hình, cụ thể' },
        { word: 'viable', phonetic: '/ˈvaɪəbəl/', partOfSpeech: 'adjective', definition: 'Capable of working successfully; feasible', example: 'Solar energy is a viable alternative to fossil fuels.', vietnameseMeaning: 'Khả thi' },
        { word: 'versatile', phonetic: '/ˈvɜːsətaɪl/', partOfSpeech: 'adjective', definition: 'Able to adapt or be adapted to many functions', example: 'English is a versatile language used in many fields.', vietnameseMeaning: 'Đa năng, linh hoạt' },
    ],
    [
        { word: 'plausible', phonetic: '/ˈplɔːzɪbəl/', partOfSpeech: 'adjective', definition: 'Seeming reasonable or probable', example: 'His explanation sounds plausible but lacks evidence.', vietnameseMeaning: 'Có vẻ hợp lý' },
        { word: 'albeit', phonetic: '/ɔːlˈbiːɪt/', partOfSpeech: 'conjunction', definition: 'Although', example: 'The plan is ambitious, albeit difficult to execute.', vietnameseMeaning: 'Mặc dù' },
        { word: 'conducive', phonetic: '/kənˈdjuːsɪv/', partOfSpeech: 'adjective', definition: 'Making a situation or outcome likely or possible', example: 'A quiet environment is conducive to effective studying.', vietnameseMeaning: 'Có lợi cho' },
        { word: 'depict', phonetic: '/dɪˈpɪkt/', partOfSpeech: 'verb', definition: 'To show or represent by drawing or in words', example: 'The graph depicts a steady increase in population.', vietnameseMeaning: 'Miêu tả, mô tả' },
        { word: 'elicit', phonetic: '/ɪˈlɪsɪt/', partOfSpeech: 'verb', definition: 'To draw out a response or answer', example: 'The survey was designed to elicit honest feedback.', vietnameseMeaning: 'Gợi ra, khơi gợi' },
        { word: 'foster', phonetic: '/ˈfɒstər/', partOfSpeech: 'verb', definition: 'To encourage or promote the development of something', example: 'Schools should foster creativity and critical thinking.', vietnameseMeaning: 'Thúc đẩy, nuôi dưỡng' },
    ],
];

// Reuse/extend for weeks 3-4 with harder words
const vocabWeek3 = [
    [
        { word: 'juxtapose', phonetic: '/ˈdʒʌkstəpəʊz/', partOfSpeech: 'verb', definition: 'To place side by side for comparison', example: 'The essay juxtaposes ancient and modern educational methods.', vietnameseMeaning: 'Đặt cạnh nhau để so sánh' },
        { word: 'proliferate', phonetic: '/prəˈlɪfəreɪt/', partOfSpeech: 'verb', definition: 'To increase rapidly in number', example: 'Online courses have proliferated in recent years.', vietnameseMeaning: 'Sinh sôi, gia tăng nhanh' },
        { word: 'stringent', phonetic: '/ˈstrɪndʒənt/', partOfSpeech: 'adjective', definition: 'Strict, precise, and exacting', example: 'Stringent regulations are needed to control pollution.', vietnameseMeaning: 'Nghiêm ngặt' },
        { word: 'corroborate', phonetic: '/kəˈrɒbəreɪt/', partOfSpeech: 'verb', definition: 'To confirm or give support to a statement', example: 'The witness testimony corroborates the evidence.', vietnameseMeaning: 'Chứng thực' },
        { word: 'dichotomy', phonetic: '/daɪˈkɒtəmi/', partOfSpeech: 'noun', definition: 'A division into two contrasting things', example: 'There is a dichotomy between theory and practice.', vietnameseMeaning: 'Sự phân đôi, chia đôi' },
        { word: 'extrapolate', phonetic: '/ɪkˈstræpəleɪt/', partOfSpeech: 'verb', definition: 'To extend known information to predict the unknown', example: 'We can extrapolate future trends from current data.', vietnameseMeaning: 'Suy đoán, ngoại suy' },
    ],
    [
        { word: 'heuristic', phonetic: '/hjʊˈrɪstɪk/', partOfSpeech: 'adjective/noun', definition: 'Enabling someone to learn or discover independently', example: 'The teacher uses a heuristic method of investigation.', vietnameseMeaning: 'Phương pháp tự khám phá' },
        { word: 'impetus', phonetic: '/ˈɪmpɪtəs/', partOfSpeech: 'noun', definition: 'The force or energy with which something moves; motivation', example: 'The pandemic provided the impetus for digital transformation.', vietnameseMeaning: 'Động lực thúc đẩy' },
        { word: 'nuance', phonetic: '/ˈnjuːɒns/', partOfSpeech: 'noun', definition: 'A subtle difference in meaning, expression, or sound', example: 'Understanding cultural nuances is important in IELTS Speaking.', vietnameseMeaning: 'Sắc thái' },
        { word: 'perpetuate', phonetic: '/pəˈpetʃueɪt/', partOfSpeech: 'verb', definition: 'To make something continue indefinitely', example: 'Such stereotypes only perpetuate inequality.', vietnameseMeaning: 'Duy trì mãi' },
        { word: 'quintessential', phonetic: '/ˌkwɪntɪˈsenʃəl/', partOfSpeech: 'adjective', definition: 'Representing the most perfect example of a quality', example: 'London is the quintessential cosmopolitan city.', vietnameseMeaning: 'Tinh túy, mẫu mực nhất' },
        { word: 'ramification', phonetic: '/ˌræmɪfɪˈkeɪʃən/', partOfSpeech: 'noun', definition: 'A complex consequence of an action or event', example: 'The ramifications of climate change are far-reaching.', vietnameseMeaning: 'Hệ quả phức tạp' },
    ],
    [
        { word: 'anomaly', phonetic: '/əˈnɒməli/', partOfSpeech: 'noun', definition: 'Something that deviates from what is standard or expected', example: 'This data point appears to be an anomaly.', vietnameseMeaning: 'Sự bất thường' },
        { word: 'catalyze', phonetic: '/ˈkætəlaɪz/', partOfSpeech: 'verb', definition: 'To cause or accelerate a reaction or change', example: 'The new policy catalyzed economic reforms.', vietnameseMeaning: 'Xúc tác, thúc đẩy' },
        { word: 'disseminate', phonetic: '/dɪˈsemɪneɪt/', partOfSpeech: 'verb', definition: 'To spread widely', example: 'Social media helps disseminate information rapidly.', vietnameseMeaning: 'Phổ biến, truyền bá' },
        { word: 'ephemeral', phonetic: '/ɪˈfemərəl/', partOfSpeech: 'adjective', definition: 'Lasting for a very short time', example: 'Fame on social media is often ephemeral.', vietnameseMeaning: 'Phù du, thoáng qua' },
        { word: 'homogeneous', phonetic: '/ˌhɒməˈdʒiːniəs/', partOfSpeech: 'adjective', definition: 'Of the same kind; uniform', example: 'The class is not homogeneous — students have different levels.', vietnameseMeaning: 'Đồng nhất' },
        { word: 'indiscriminate', phonetic: '/ˌɪndɪˈskrɪmɪnət/', partOfSpeech: 'adjective', definition: 'Done at random or without careful judgment', example: 'Indiscriminate use of antibiotics leads to resistance.', vietnameseMeaning: 'Bừa bãi, không phân biệt' },
    ],
    [
        { word: 'lethargic', phonetic: '/ləˈθɑːdʒɪk/', partOfSpeech: 'adjective', definition: 'Lacking energy; sluggish', example: 'Students feel lethargic after a heavy lunch.', vietnameseMeaning: 'Uể oải' },
        { word: 'multifaceted', phonetic: '/ˌmʌltiˈfæsɪtɪd/', partOfSpeech: 'adjective', definition: 'Having many different aspects or features', example: 'Education reform is a multifaceted issue.', vietnameseMeaning: 'Đa diện' },
        { word: 'paradox', phonetic: '/ˈpærədɒks/', partOfSpeech: 'noun', definition: 'A seemingly contradictory statement that may be true', example: 'It is a paradox that technology both connects and isolates us.', vietnameseMeaning: 'Nghịch lý' },
        { word: 'reciprocal', phonetic: '/rɪˈsɪprəkəl/', partOfSpeech: 'adjective', definition: 'Given, felt, or done in return', example: 'A reciprocal relationship benefits both parties.', vietnameseMeaning: 'Có qua có lại' },
        { word: 'synthesis', phonetic: '/ˈsɪnθəsɪs/', partOfSpeech: 'noun', definition: 'The combination of ideas to form a theory or system', example: 'Your essay should be a synthesis of multiple perspectives.', vietnameseMeaning: 'Sự tổng hợp' },
        { word: 'truncate', phonetic: '/trʌŋˈkeɪt/', partOfSpeech: 'verb', definition: 'To shorten by cutting off the top or end', example: 'The editor decided to truncate the article for the newsletter.', vietnameseMeaning: 'Cắt ngắn' },
    ],
    [
        { word: 'ameliorate', phonetic: '/əˈmiːlɪəreɪt/', partOfSpeech: 'verb', definition: 'To make better or more tolerable', example: 'The new policies aim to ameliorate working conditions.', vietnameseMeaning: 'Cải thiện' },
        { word: 'circumvent', phonetic: '/ˌsɜːkəmˈvent/', partOfSpeech: 'verb', definition: 'To find a way around an obstacle or restriction', example: 'Companies sometimes circumvent environmental regulations.', vietnameseMeaning: 'Lách, né tránh' },
        { word: 'delineate', phonetic: '/dɪˈlɪniːeɪt/', partOfSpeech: 'verb', definition: 'To describe or outline with precision', example: 'The report clearly delineates the scope of the problem.', vietnameseMeaning: 'Phác họa, mô tả rõ' },
        { word: 'equitable', phonetic: '/ˈekwɪtəbəl/', partOfSpeech: 'adjective', definition: 'Fair and impartial', example: 'An equitable distribution of resources is essential.', vietnameseMeaning: 'Công bằng' },
        { word: 'galvanize', phonetic: '/ˈɡælvənaɪz/', partOfSpeech: 'verb', definition: 'To shock or excite someone into taking action', example: 'The crisis galvanized the community into action.', vietnameseMeaning: 'Thúc đẩy hành động' },
        { word: 'incumbent', phonetic: '/ɪnˈkʌmbənt/', partOfSpeech: 'adjective', definition: 'Necessary as a duty or responsibility', example: 'It is incumbent upon governments to protect the environment.', vietnameseMeaning: 'Có bổn phận, đương nhiệm' },
    ],
    [
        { word: 'concomitant', phonetic: '/kənˈkɒmɪtənt/', partOfSpeech: 'adjective', definition: 'Naturally accompanying or associated', example: 'Economic growth and its concomitant environmental problems.', vietnameseMeaning: 'Đi kèm' },
        { word: 'debilitate', phonetic: '/dɪˈbɪlɪteɪt/', partOfSpeech: 'verb', definition: 'To make weak or feeble', example: 'The disease can debilitate patients for months.', vietnameseMeaning: 'Làm suy yếu' },
        { word: 'extraneous', phonetic: '/ɪkˈstreɪniəs/', partOfSpeech: 'adjective', definition: 'Irrelevant or unrelated to the subject', example: 'Remove any extraneous information from your essay.', vietnameseMeaning: 'Không liên quan, thừa' },
        { word: 'jurisprudence', phonetic: '/ˌdʒʊərɪsˈpruːdəns/', partOfSpeech: 'noun', definition: 'The theory or philosophy of law', example: 'His work in jurisprudence influenced modern legal systems.', vietnameseMeaning: 'Luật học' },
        { word: 'obfuscate', phonetic: '/ˈɒbfʌskeɪt/', partOfSpeech: 'verb', definition: 'To make something unclear or hard to understand', example: 'Technical jargon can obfuscate the main argument.', vietnameseMeaning: 'Làm tối nghĩa' },
        { word: 'precarious', phonetic: '/prɪˈkeəriəs/', partOfSpeech: 'adjective', definition: 'Not securely held; dangerously likely to fall or collapse', example: 'Many workers are in precarious employment situations.', vietnameseMeaning: 'Bấp bênh, không chắc chắn' },
    ],
    [
        { word: 'redress', phonetic: '/rɪˈdres/', partOfSpeech: 'verb/noun', definition: 'To remedy or set right an undesirable situation', example: 'Policies should redress the balance between work and life.', vietnameseMeaning: 'Sửa chữa, khắc phục' },
        { word: 'salient', phonetic: '/ˈseɪliənt/', partOfSpeech: 'adjective', definition: 'Most noticeable or important', example: 'The salient point of the argument is economic growth.', vietnameseMeaning: 'Nổi bật, quan trọng nhất' },
        { word: 'tenuous', phonetic: '/ˈtenjuəs/', partOfSpeech: 'adjective', definition: 'Very weak or slight', example: 'The connection between the two events is tenuous at best.', vietnameseMeaning: 'Mong manh, yếu ớt' },
        { word: 'unilateral', phonetic: '/ˌjuːnɪˈlætərəl/', partOfSpeech: 'adjective', definition: 'Done by one person/group without agreement of others', example: 'A unilateral decision was made without consulting the team.', vietnameseMeaning: 'Đơn phương' },
        { word: 'vacillate', phonetic: '/ˈvæsɪleɪt/', partOfSpeech: 'verb', definition: 'To waver between different opinions or actions', example: 'The government continues to vacillate on climate policy.', vietnameseMeaning: 'Do dự, lưỡng lự' },
        { word: 'watershed', phonetic: '/ˈwɔːtəʃed/', partOfSpeech: 'noun', definition: 'A turning point or event marking a change of course', example: 'The invention of the internet was a watershed moment in history.', vietnameseMeaning: 'Bước ngoặt' },
    ],
];

// ─── READING PASSAGES ────────────────────────────
function makeReading(title, passage, questions) {
    return { title, passage, questions };
}

const readingsWeek1 = [
    makeReading('The Digital Classroom Revolution',
        'In recent years, digital technology has fundamentally transformed the education landscape. Traditional classroom settings, where a teacher lectures to rows of attentive students, are increasingly being supplemented — and in some cases replaced — by online learning platforms. The COVID-19 pandemic accelerated this transition dramatically. According to UNESCO, school closures affected over 1.5 billion students worldwide, forcing educational institutions to adopt remote learning solutions almost overnight.\n\nProponents of digital education argue that it offers unprecedented flexibility. Students can learn at their own pace, revisit difficult concepts through recorded lectures, and access a wealth of resources from anywhere in the world. Moreover, adaptive learning algorithms can tailor content to individual needs, potentially making education more personalized than ever before.\n\nHowever, critics point to significant drawbacks. The digital divide means that students from lower-income backgrounds often lack reliable internet access or suitable devices. Social isolation, screen fatigue, and the absence of face-to-face interaction with peers and teachers can also hinder the learning experience. Research from the OECD suggests that while technology can enhance education, it is not a substitute for skilled teaching and meaningful human interaction.',
        [
            { question: 'What event significantly accelerated the adoption of digital learning?', options: ['The invention of artificial intelligence', 'The COVID-19 pandemic', 'The rise of social media', 'Government education reforms'], correctAnswer: 'The COVID-19 pandemic', explanation: 'The passage states that "The COVID-19 pandemic accelerated this transition dramatically."' },
            { question: 'According to the passage, what is one advantage of digital education?', options: ['Students must follow a strict schedule', 'Teachers can monitor students more easily', 'Students can learn at their own pace', 'It requires less technology'], correctAnswer: 'Students can learn at their own pace', explanation: 'The passage says "Students can learn at their own pace, revisit difficult concepts..."' },
            { question: 'What does the term "digital divide" refer to in this context?', options: ['The gap in digital skills among teachers', 'The difference between old and new technology', 'The unequal access to technology based on income', 'The separation of online and offline learning'], correctAnswer: 'The unequal access to technology based on income', explanation: 'The passage explains "students from lower-income backgrounds often lack reliable internet access."' },
        ]
    ),
    makeReading('Urban Green Spaces and Public Health',
        'As cities continue to expand, the importance of urban green spaces has become a critical topic in public health discussions. Parks, gardens, tree-lined streets, and community green areas provide more than just aesthetic appeal — they are essential for the physical and mental well-being of city residents.\n\nStudies have consistently shown that access to green spaces reduces stress levels, lowers blood pressure, and decreases the risk of cardiovascular disease. A 2019 study published in The Lancet revealed that people living near green areas had a 20% lower risk of depression compared to those in concrete-dominated environments. Physical activity levels also tend to be higher in neighborhoods with accessible parks.\n\nDespite these benefits, green spaces are unevenly distributed across urban areas. Wealthier neighborhoods typically have more parkland per capita than poorer ones, creating what researchers call "green inequality." This disparity has prompted some cities, such as Singapore and Copenhagen, to integrate green infrastructure into urban planning from the outset, ensuring equitable access for all residents.',
        [
            { question: 'According to The Lancet study, what is one mental health benefit of living near green spaces?', options: ['Improved sleep quality', '20% lower risk of depression', 'Higher academic performance', 'Better social relationships'], correctAnswer: '20% lower risk of depression', explanation: 'The passage cites a Lancet study showing "a 20% lower risk of depression."' },
            { question: 'What does "green inequality" refer to?', options: ['Different types of plants in parks', 'The unequal distribution of green spaces across neighborhoods', 'Environmental pollution', 'The cost of maintaining parks'], correctAnswer: 'The unequal distribution of green spaces across neighborhoods', explanation: 'The passage explains green inequality as wealthier areas having more parkland than poorer ones.' },
            { question: 'Which cities are mentioned as examples of integrating green infrastructure?', options: ['London and New York', 'Singapore and Copenhagen', 'Tokyo and Berlin', 'Sydney and Toronto'], correctAnswer: 'Singapore and Copenhagen', explanation: 'The passage specifically mentions "Singapore and Copenhagen."' },
        ]
    ),
    makeReading('The Science of Sleep',
        'Sleep is one of the most fundamental biological processes, yet it remains poorly understood by many. Adults typically need between seven and nine hours of sleep per night, but studies indicate that a growing number of people in industrialized societies are chronically sleep-deprived.\n\nDuring sleep, the brain undergoes critical maintenance processes. The glymphatic system, discovered in 2012, flushes out waste products that accumulate during waking hours, including beta-amyloid, a protein linked to Alzheimer\'s disease. Sleep also plays a vital role in memory consolidation; the hippocampus replays the day\'s experiences, transferring information to long-term storage.\n\nThe consequences of sleep deprivation extend far beyond feeling tired. Chronic lack of sleep has been linked to obesity, diabetes, weakened immunity, and impaired cognitive function. A study by the AAA Foundation for Traffic Safety found that drivers who slept fewer than five hours were four to five times more likely to be involved in a crash than those who slept seven or more hours.\n\nExperts recommend maintaining consistent sleep schedules, limiting screen time before bed, and creating dark, cool sleeping environments to improve sleep quality.',
        [
            { question: 'What is the role of the glymphatic system during sleep?', options: ['It produces new brain cells', 'It regulates body temperature', 'It flushes out waste products from the brain', 'It controls dreaming'], correctAnswer: 'It flushes out waste products from the brain', explanation: 'The passage states it "flushes out waste products that accumulate during waking hours."' },
            { question: 'How much more likely are sleep-deprived drivers to be involved in crashes?', options: ['Two times', 'Three times', 'Four to five times', 'Ten times'], correctAnswer: 'Four to five times', explanation: 'The passage says "four to five times more likely to be involved in a crash."' },
            { question: 'What is one recommendation for improving sleep quality?', options: ['Exercise intensely before bed', 'Use bright lights in the bedroom', 'Maintain consistent sleep schedules', 'Take sleeping medication'], correctAnswer: 'Maintain consistent sleep schedules', explanation: 'Experts recommend "maintaining consistent sleep schedules."' },
        ]
    ),
];

// Generate more readings by using templates for remaining days
function generateReading(dayNum) {
    const topics = [
        { title: 'Remote Work and Productivity', passage: 'The shift toward remote work, which began as a necessity during the global pandemic, has evolved into a permanent feature of the modern workplace. According to a Stanford study, remote workers showed a 13% increase in productivity compared to their office-based counterparts. However, this comes with caveats — the same study noted that remote workers were also 50% less likely to receive a promotion, suggesting potential career penalties.\n\nThe benefits of remote work extend beyond productivity metrics. Employees save an average of 40 minutes per day on commuting, which translates to approximately 8 days per year. This reclaimed time can be channeled into exercise, family, or further education. Companies also benefit from reduced overhead costs and access to a wider talent pool unrestricted by geography.\n\nDespite these advantages, significant challenges remain. The blurring of work-life boundaries can lead to burnout, with remote workers reporting difficulty in "switching off." Social isolation and the lack of spontaneous collaboration have also been cited as drawbacks. Many organizations are now adopting hybrid models, seeking to combine the flexibility of remote work with the social benefits of in-person interaction.', questions: [
            { question: 'By how much did remote workers increase their productivity according to Stanford?', options: ['10%', '13%', '20%', '50%'], correctAnswer: '13%', explanation: 'The passage cites "a 13% increase in productivity."' },
            { question: 'What was a negative finding about remote workers in the study?', options: ['They worked fewer hours', 'They were less creative', 'They were 50% less likely to receive a promotion', 'They had lower job satisfaction'], correctAnswer: 'They were 50% less likely to receive a promotion', explanation: 'The study noted remote workers were "50% less likely to receive a promotion."' },
            { question: 'What solution are many organizations adopting?', options: ['Full-time remote work', 'Mandatory office attendance', 'Hybrid models', 'Four-day work weeks'], correctAnswer: 'Hybrid models', explanation: 'The passage states "Many organizations are now adopting hybrid models."' },
        ] },
        { title: 'The Plastic Pollution Crisis', passage: 'Approximately 8 million metric tons of plastic enter the world\'s oceans every year, creating what scientists describe as an unprecedented environmental crisis. This plastic waste does not biodegrade; instead, it breaks down into smaller pieces called microplastics, which have been found in virtually every marine environment studied, from the deepest ocean trenches to Arctic ice.\n\nThe impact on marine life is devastating. Over 700 species, including endangered sea turtles and whales, have been documented ingesting or becoming entangled in plastic debris. The Great Pacific Garbage Patch, a massive accumulation of floating plastic between Hawaii and California, now covers an area roughly three times the size of France.\n\nSolutions range from individual behavioral changes to systemic policy reforms. The European Union\'s Single-Use Plastics Directive, implemented in 2021, bans certain single-use plastic products and requires member states to achieve specific collection and recycling targets. Meanwhile, innovative companies are developing biodegradable alternatives made from seaweed, mushroom fibers, and other organic materials.', questions: [
            { question: 'How much plastic enters the oceans annually?', options: ['2 million tons', '5 million tons', '8 million tons', '12 million tons'], correctAnswer: '8 million tons', explanation: 'The passage states "8 million metric tons of plastic enter the world\'s oceans every year."' },
            { question: 'How large is the Great Pacific Garbage Patch?', options: ['The size of Texas', 'Three times the size of France', 'The size of Australia', 'Twice the size of India'], correctAnswer: 'Three times the size of France', explanation: 'The passage says it "covers an area roughly three times the size of France."' },
            { question: 'What is the EU doing to combat plastic pollution?', options: ['Increasing plastic production taxes', 'Banning all plastic products', 'Implementing the Single-Use Plastics Directive', 'Funding ocean cleanup robots'], correctAnswer: 'Implementing the Single-Use Plastics Directive', explanation: 'The passage mentions "the European Union\'s Single-Use Plastics Directive."' },
        ] },
        { title: 'Artificial Intelligence in Healthcare', passage: 'Artificial intelligence is poised to revolutionize healthcare in ways previously unimaginable. Machine learning algorithms can now analyze medical images with accuracy that rivals or exceeds that of experienced radiologists. In 2020, Google\'s DeepMind developed an AI system that could predict the 3D structure of proteins, solving a problem that had challenged scientists for 50 years.\n\nIn diagnostic medicine, AI tools are being deployed to detect conditions ranging from diabetic retinopathy to skin cancer. These tools are particularly valuable in developing countries where specialist physicians are scarce. An AI diagnostic system can potentially screen thousands of patients per day, dramatically reducing wait times and enabling earlier intervention.\n\nYet the integration of AI into healthcare raises important ethical questions. Issues of data privacy, algorithmic bias, and accountability when AI makes errors remain largely unresolved. There is also the question of whether AI will replace physicians or serve as a tool to augment their capabilities. Most experts advocate for the latter, envisioning a future where AI handles routine analysis while humans focus on complex decision-making and patient care.', questions: [
            { question: 'What achievement did DeepMind accomplish in 2020?', options: ['Created a robot surgeon', 'Predicted 3D protein structures', 'Developed a new vaccine', 'Built a digital hospital'], correctAnswer: 'Predicted 3D protein structures', explanation: 'DeepMind "could predict the 3D structure of proteins."' },
            { question: 'Why are AI diagnostic tools particularly valuable in developing countries?', options: ['They are cheaper than equipment', 'Specialist physicians are scarce', 'Patients prefer digital consultations', 'Internet access is widespread'], correctAnswer: 'Specialist physicians are scarce', explanation: 'The passage explains these tools are valuable "where specialist physicians are scarce."' },
            { question: 'What do most experts envision for AI in healthcare?', options: ['AI will fully replace doctors', 'AI should be banned from medicine', 'AI will augment physician capabilities', 'AI will only be used in surgery'], correctAnswer: 'AI will augment physician capabilities', explanation: 'Most experts envision "AI handles routine analysis while humans focus on complex decision-making."' },
        ] },
    ];
    const idx = (dayNum - 1) % topics.length;
    return topics[idx];
}

// ─── LISTENING TASKS ────────────────────────────
function makeListening(title, audioUrl, transcript, questions) {
    return { title, audioUrl, transcript, questions };
}

const listeningPool = [
    makeListening('Campus Orientation Dialogue',
        `${LISTENING_BASE}/SoundHelix-Song-1.mp3`,
        'Student A: Excuse me, could you tell me where the library is? Student B: Of course! Go straight ahead past the cafeteria, then turn left at the Science Building. The library is the large glass building on your right. Student A: Thank you! Is it open on weekends? Student B: Yes, it\'s open from 9 AM to 6 PM on Saturdays, but closed on Sundays.',
        [
            { question: 'What building should the student pass first?', options: ['The library', 'The Science Building', 'The cafeteria', 'The gym'], correctAnswer: 'The cafeteria', explanation: 'Student B says "Go straight ahead past the cafeteria."' },
            { question: 'What does the library look like?', options: ['A brick building', 'A large glass building', 'A wooden structure', 'A tall tower'], correctAnswer: 'A large glass building', explanation: 'The library is described as "the large glass building on your right."' },
            { question: 'When is the library closed?', options: ['Saturdays', 'Sundays', 'Mondays', 'Weekdays'], correctAnswer: 'Sundays', explanation: 'The library is "closed on Sundays."' },
        ]
    ),
    makeListening('Weather Forecast Report',
        `${LISTENING_BASE}/SoundHelix-Song-2.mp3`,
        'Good morning! Here is your weather forecast for the coming week. Monday and Tuesday will be mostly sunny with temperatures reaching 25 degrees Celsius. However, from Wednesday onwards, we are expecting a cold front to move in, bringing rain and cooler temperatures around 15 degrees. Residents are advised to carry umbrellas from mid-week. The weekend looks brighter with sunshine returning by Saturday.',
        [
            { question: 'What will the weather be like on Monday?', options: ['Rainy and cold', 'Mostly sunny', 'Cloudy with wind', 'Snowy'], correctAnswer: 'Mostly sunny', explanation: 'The forecast says "Monday and Tuesday will be mostly sunny."' },
            { question: 'What temperature is expected on Wednesday?', options: ['25 degrees', '20 degrees', '15 degrees', '10 degrees'], correctAnswer: '15 degrees', explanation: 'The cold front brings "cooler temperatures around 15 degrees."' },
            { question: 'When is the sunshine expected to return?', options: ['Thursday', 'Friday', 'Saturday', 'Sunday'], correctAnswer: 'Saturday', explanation: 'The forecast says "sunshine returning by Saturday."' },
        ]
    ),
    makeListening('Job Interview Discussion',
        `${LISTENING_BASE}/SoundHelix-Song-3.mp3`,
        'Interviewer: So, what attracted you to this position? Candidate: Well, I have always been passionate about environmental science, and your company is a leader in renewable energy research. I was particularly impressed by your recent solar panel efficiency project. Interviewer: That\'s great to hear. What would you say is your greatest strength? Candidate: I would say my ability to work well in a team. In my previous role, I led a team of 12 researchers on a two-year project that resulted in three published papers.',
        [
            { question: 'What field is the candidate passionate about?', options: ['Computer science', 'Environmental science', 'Marketing', 'Finance'], correctAnswer: 'Environmental science', explanation: 'The candidate says "I have always been passionate about environmental science."' },
            { question: 'What project impressed the candidate?', options: ['A wind turbine design', 'A solar panel efficiency project', 'An electric car development', 'A water purification system'], correctAnswer: 'A solar panel efficiency project', explanation: 'The candidate mentions being "impressed by your recent solar panel efficiency project."' },
            { question: 'How many people did the candidate lead in their previous role?', options: ['5', '8', '12', '20'], correctAnswer: '12', explanation: 'The candidate says "I led a team of 12 researchers."' },
        ]
    ),
    makeListening('Museum Audio Guide',
        `${LISTENING_BASE}/SoundHelix-Song-4.mp3`,
        'Welcome to the National History Museum. You are now entering the Ancient Civilizations wing. On your left, you will see artifacts from ancient Egypt, including a replica of the Rosetta Stone. The original is housed in the British Museum in London. Moving forward, our collection of Greek pottery dates back to the 5th century BC. Please note that photography is not permitted in this section. The next gallery features Roman artifacts and is open from 10 AM.',
        [
            { question: 'Where is the original Rosetta Stone housed?', options: ['The National History Museum', 'The Louvre', 'The British Museum', 'The Smithsonian'], correctAnswer: 'The British Museum', explanation: 'The guide says "The original is housed in the British Museum in London."' },
            { question: 'How old is the Greek pottery collection?', options: ['3rd century BC', '5th century BC', '7th century BC', '1st century AD'], correctAnswer: '5th century BC', explanation: 'The pottery "dates back to the 5th century BC."' },
            { question: 'What is NOT permitted in the Greek pottery section?', options: ['Touching artifacts', 'Photography', 'Eating', 'Speaking loudly'], correctAnswer: 'Photography', explanation: 'The audio guide says "photography is not permitted in this section."' },
        ]
    ),
];

// ─── SPEAKING TASKS ────────────────────────────
const speakingPool = [
    { prompt: 'Describe a place you have visited that you particularly enjoyed. You should say: where the place is, when you went there, what you did there, and explain why you enjoyed it.', sampleAnswer: 'I would like to talk about Da Nang, a beautiful coastal city in central Vietnam that I visited last summer. My family and I spent five days exploring the city, visiting the famous Marble Mountains, swimming at My Khe Beach, and enjoying the local seafood. What made this trip especially enjoyable was the combination of natural beauty and modern amenities. The people were incredibly friendly, the food was delicious and affordable, and the weather was perfect.', tips: ['Use descriptive language to paint a picture', 'Organize your response chronologically', 'Express personal feelings and emotions', 'Speak for the full 2 minutes'], durationSeconds: 120 },
    { prompt: 'Some people think that it is more important to spend money on roads and motorways than on public transport systems like trains. To what extent do you agree or disagree?', sampleAnswer: 'I partially agree with this statement. While roads are essential for connecting remote areas and supporting the economy, public transport systems are equally important. Trains and buses reduce traffic congestion, lower carbon emissions, and provide affordable mobility for those who cannot afford private vehicles. I believe a balanced approach is necessary — investing in both roads and public transport to create an efficient, sustainable transportation network.', tips: ['State your position clearly', 'Give reasons for both sides', 'Use linking words: however, moreover, nevertheless', 'Conclude with your final opinion'], durationSeconds: 120 },
    { prompt: 'Talk about a skill you learned as a child that you still use today. You should say: what the skill is, who taught you, how you learned it, and explain why it is still useful.', sampleAnswer: 'The skill I want to talk about is cooking, which my grandmother taught me when I was about 8 years old. She would let me help her in the kitchen every weekend, starting with simple tasks like washing vegetables and gradually teaching me how to prepare traditional Vietnamese dishes. This skill is invaluable today because it allows me to eat healthily, save money, and share my culture with friends from different countries.', tips: ['Include specific details and examples', 'Show how the skill has evolved over time', 'Connect past learning to present application', 'Maintain natural intonation'], durationSeconds: 120 },
    { prompt: 'Describe a person who has influenced you significantly. You should say: who this person is, how you know them, what they have done, and explain why they influenced you.', sampleAnswer: 'The person who influenced me the most is my high school English teacher, Ms. Nguyen. She was not only an excellent teacher but also a mentor who believed in my potential when I doubted myself. She encouraged me to participate in English speaking competitions, which helped me overcome my fear of public speaking. Her dedication inspired me to pursue language learning passionately, which eventually led me to study abroad.', tips: ['Be specific about what they did', 'Explain the impact on your life', 'Use past and present tenses appropriately', 'Show emotional connection'], durationSeconds: 120 },
    { prompt: 'Do you think children should learn a foreign language at primary school? Why or why not?', sampleAnswer: 'I strongly believe that children should learn a foreign language at primary school. Research consistently shows that younger learners acquire languages more naturally and develop better pronunciation. Additionally, learning a foreign language at an early age enhances cognitive development, including problem-solving skills and creativity. However, the approach must be age-appropriate — focusing on fun, interactive activities rather than formal grammar instruction.', tips: ['Give a clear opinion immediately', 'Support with evidence or examples', 'Acknowledge the opposing view', 'Use academic vocabulary naturally'], durationSeconds: 90 },
];

// ═══════════════════════════════════════════════════════════════
//  BUILD ALL 30 DAYS
// ═══════════════════════════════════════════════════════════════

function buildAllDays() {
    const days = [];

    for (let d = 1; d <= 30; d++) {
        let phase, title, desc;

        if (d <= 7) {
            phase = 'Foundation';
            const titles = [
                'Core Academic Vocabulary & Reading Basics',
                'Skimming & Scanning Techniques',
                'Introduction to IELTS Listening',
                'Speaking Part 1: Personal Questions',
                'Paragraph Structure & Main Ideas',
                'Note-Taking Strategies',
                'Week 1 Review & Self-Assessment',
            ];
            title = `Day ${d}: ${titles[d - 1]}`;
            desc = `Foundation Phase — Build your core English skills with essential vocabulary and fundamental reading and listening strategies.`;
        } else if (d <= 14) {
            phase = 'Building';
            const titles = [
                'Advanced Vocabulary & Collocations',
                'Reading: True/False/Not Given',
                'Matching Headings & Information',
                'Listening: Map & Diagram Labeling',
                'Speaking Part 2: Cue Cards',
                'Writing-Integrated Vocabulary',
                'Week 2 Review & Progress Check',
            ];
            title = `Day ${d}: ${titles[d - 8]}`;
            desc = `Building Phase — Develop intermediate strategies for tackling IELTS question types with confidence.`;
        } else if (d <= 21) {
            phase = 'Advanced';
            const titles = [
                'C1 Academic Vocabulary',
                'Reading: Multiple Choice & Summary',
                'Sentence Completion Strategies',
                'Listening: Section 3 & 4 Tactics',
                'Speaking Part 3: Abstract Discussion',
                'Complex Grammar in Context',
                'Week 3 Review & Mock Practice',
            ];
            title = `Day ${d}: ${titles[d - 15]}`;
            desc = `Advanced Phase — Master high-level academic language and complex exam strategies.`;
        } else {
            phase = 'Mock Test';
            const titles = [
                'Full Reading Mock Test 1',
                'Full Listening Mock Test 1',
                'Full Speaking Mock Test 1',
                'Vocabulary Revision Sprint',
                'Full Reading Mock Test 2',
                'Full Listening Mock Test 2',
                'Full Speaking Mock Test 2',
                'Error Analysis & Weaknesses',
                'Final Strategy & Exam Readiness',
            ];
            title = `Day ${d}: ${titles[d - 22]}`;
            desc = `Mock Test Phase — Simulate real exam conditions and refine your test-taking strategy.`;
        }

        // Pick vocab
        let vocab;
        if (d <= 7) vocab = vocabWeek1[d - 1];
        else if (d <= 14) vocab = vocabWeek2[d - 8];
        else if (d <= 21) vocab = vocabWeek3[d - 15];
        else vocab = vocabWeek3[(d - 22) % vocabWeek3.length]; // recycle advanced vocab

        // Pick reading
        let reading;
        if (d <= 3) reading = readingsWeek1[d - 1];
        else reading = generateReading(d);

        // Pick listening
        const listening = listeningPool[(d - 1) % listeningPool.length];

        // Pick grammar
        const grammar = grammarPool[(d - 1) % grammarPool.length];

        days.push(buildDay(d, title, desc, phase, vocab, grammar, reading, listening));
    }

    return days;
}

// ═══════════════════════════════════════════════════════════════
//  SEED EXECUTION
// ═══════════════════════════════════════════════════════════════
const seedCourseTasks = async () => {
    try {
        await connectDB();

        // Find the free IELTS course (not premium)
        const ieltsCourse = await Course.findOne({ targetType: 'IELTS', isPremium: false });

        if (!ieltsCourse) {
            console.log('❌ No free IELTS course found. Creating one...');

            const newCourse = new Course({
                title: 'IELTS Intensive 30-Day Sprint',
                description: 'Achieve a 7.0+ score by focusing on all 4 skills: Reading, Listening, Speaking, and Vocabulary mastery. Designed for intermediate learners ready for daily structured missions.',
                targetType: 'IELTS',
                durationDays: 30,
                level: 'Upper Intermediate',
                image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1000',
                isPremium: false,
                price: 0,
                days: buildAllDays(),
            });

            await newCourse.save();
            console.log('✅ Created new IELTS course with 30 days of structured tasks!');
        } else {
            ieltsCourse.days = buildAllDays();
            ieltsCourse.durationDays = 30;
            await ieltsCourse.save();
            console.log('✅ Updated existing IELTS course with 30 days of structured tasks!');
        }

        // Also update TOEIC course if it exists
        const toeicCourse = await Course.findOne({ targetType: 'TOEIC', isPremium: false });
        if (toeicCourse) {
            toeicCourse.days = buildAllDays().map(day => ({
                ...day,
                title: day.title.replace('IELTS', 'TOEIC'),
                description: day.description.replace('IELTS', 'TOEIC'),
            }));
            await toeicCourse.save();
            console.log('✅ Updated TOEIC course with structured tasks too!');
        }

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedCourseTasks();
