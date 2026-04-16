const { calculateExamScore } = require('../src/services/examScoring');

describe('Exam Scoring Service', () => {
    const mockQuestions = [
        { _id: 'q1', text: 'Q1', correctAnswerIndex: 0, points: 1 },
        { _id: 'q2', text: 'Q2', correctAnswerIndex: 2, points: 2 },
        { _id: 'q3', text: 'Q3', correctAnswerIndex: 1, points: 1 }
    ];

    it('should correctly calculate a perfect score', () => {
        const userAnswers = [
            { questionId: 'q1', selectedOptionIndex: 0 },
            { questionId: 'q2', selectedOptionIndex: 2 },
            { questionId: 'q3', selectedOptionIndex: 1 }
        ];

        const result = calculateExamScore(mockQuestions, userAnswers);

        expect(result.score).toBe(4);
        expect(result.totalPossibleScore).toBe(4);
        expect(result.answersData.every(a => a.isCorrect)).toBe(true);
    });

    it('should correctly handle partial correctness and missing answers', () => {
        const userAnswers = [
            { questionId: 'q1', selectedOptionIndex: 1 }, // Wrong
            { questionId: 'q2', selectedOptionIndex: 2 }  // Correct, but missing q3
        ];

        const result = calculateExamScore(mockQuestions, userAnswers);

        expect(result.score).toBe(2);
        expect(result.totalPossibleScore).toBe(4);

        const q1Result = result.answersData.find(a => a.questionId === 'q1');
        const q3Result = result.answersData.find(a => a.questionId === 'q3');

        expect(q1Result.isCorrect).toBe(false);
        expect(q3Result.isCorrect).toBe(false);
        expect(q3Result.selectedOptionIndex).toBe(-1); // Marked as unanswered
    });
});
