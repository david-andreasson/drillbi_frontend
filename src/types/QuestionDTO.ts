export interface QuestionOptionDTO {
    optionLabel: string;
    optionText: string;
    isCorrect: boolean;
}

export interface QuestionDTO {
    id?: number;
    questionNumber: number;
    courseName: string;
    questionText: string;
    options: QuestionOptionDTO[];
    language: string;
    imageUrl?: string;
}