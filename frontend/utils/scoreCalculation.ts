export const cefrToIELTS = (cefr: string): number => {
    const map: Record<string, number> = {
        A1: 3.0,
        A2: 4.0,
        B1: 5.0,
        B2: 6.0,
        C1: 7.5,
        C2: 9.0,
    };
    return map[cefr] || 3.0; // Default to A1 if invalid
};

export const calculatePreparationTime = (
    currentCefr: string,
    targetScore: number,
    studyHoursPerWeek: number
): { estimatedWeeks: number; bandImprovement: number } => {
    const currentBand = cefrToIELTS(currentCefr);
    const bandImprovement = targetScore - currentBand;

    if (bandImprovement <= 0) {
        return { estimatedWeeks: 0, bandImprovement: 0 };
    }

    // General rule of thumb: ~200 hours of guided study to progress one full CEFR band (approx 1 IELTS band)
    const hoursPerBand = 200;

    // Calculate total hours needed
    const totalHoursNeeded = bandImprovement * hoursPerBand;

    const validStudyHours = studyHoursPerWeek > 0 ? studyHoursPerWeek : 1;
    const estimatedWeeks = Math.ceil(totalHoursNeeded / validStudyHours);

    return { estimatedWeeks, bandImprovement };
};
