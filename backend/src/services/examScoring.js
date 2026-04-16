/**
 * Calculates the score of a user's exam submission based on the exam's questions.
 * @param {Array} examQuestions - Array of question objects from the database (text, correctOptionIndex, points).
 * @param {Array} userAnswers - Array of user answers [{ questionId, selectedOptionIndex }].
 * @returns {Object} { score, totalPossibleScore, answersData }
 */
const calculateExamScore = (examQuestions, userAnswers) => {
    let score = 0;
    let totalPossibleScore = 0;
    const answersData = [];

    // Create a map of user answers for O(1) lookup
    const userAnswersMap = userAnswers.reduce((acc, current) => {
        acc[current.questionId] = current.selectedOptionIndex;
        return acc;
    }, {});

    examQuestions.forEach(question => {
        const questionIdStr = question._id.toString();
        const selectedOptionIndex = userAnswersMap[questionIdStr];
        const isCorrect = selectedOptionIndex === question.correctAnswerIndex;

        const points = question.points || 1;
        totalPossibleScore += points;

        if (isCorrect) {
            score += points;
        }

        answersData.push({
            questionId: question._id,
            selectedOptionIndex: selectedOptionIndex !== undefined ? selectedOptionIndex : -1,
            isCorrect
        });
    });

    return {
        score,
        totalPossibleScore,
        answersData
    };
};

module.exports = { calculateExamScore };
