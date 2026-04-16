import { cefrToIELTS, calculatePreparationTime } from './scoreCalculation';

describe('scoreCalculation', () => {
    describe('cefrToIELTS', () => {
        it('should correctly map A1 to 3.0', () => {
            expect(cefrToIELTS('A1')).toBe(3.0);
        });

        it('should correctly map B2 to 6.0', () => {
            expect(cefrToIELTS('B2')).toBe(6.0);
        });

        it('should fallback to 3.0 for unknown levels', () => {
            expect(cefrToIELTS('Z9')).toBe(3.0);
        });
    });

    describe('calculatePreparationTime', () => {
        it('should return 0 weeks if target score is already met or exceeded', () => {
            const result = calculatePreparationTime('B2', 5.5, 10);
            expect(result.estimatedWeeks).toBe(0);
            expect(result.bandImprovement).toBe(0);
        });

        it('should calculate correct weeks for a 1 band improvement at 10 hours/week', () => {
            // B1 -> 5.0, Target -> 6.0 | Improvement = 1.0 band
            // 1.0 * 200 hours = 200 hours / 10 hours per week = 20 weeks
            const result = calculatePreparationTime('B1', 6.0, 10);
            expect(result.bandImprovement).toBe(1.0);
            expect(result.estimatedWeeks).toBe(20);
        });

        it('should handle zero study hours by falling back to 1 hour to avoid Infinity', () => {
            const result = calculatePreparationTime('A2', 5.0, 0); // 4.0 to 5.0 = 1 band (200 hours)
            expect(result.estimatedWeeks).toBe(200); // 200 / 1
        });

        it('should round up weeks if uneven', () => {
            // 1 band (200 hours) at 15 hours/week = 13.33 weeks -> 14 weeks
            const result = calculatePreparationTime('B1', 6.0, 15);
            expect(result.estimatedWeeks).toBe(14);
        });
    });
});
