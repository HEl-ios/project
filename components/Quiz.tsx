
import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../constants.tsx';
import { generateQuizQuestions, generateQuizAnalysis } from '../services/geminiService.ts';
import { BadgeSlug, QuizQuestion, QuizAnalysis } from '../types.ts';
import Card from './common/Card.tsx';
import { BrainCircuitIcon } from './common/Icons.tsx';
import Spinner from './common/Spinner.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';

interface QuizProps {
  unlockBadge: (slug: BadgeSlug) => void;
}

const Quiz: React.FC<QuizProps> = ({ unlockBadge }) => {
  const { t, language } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const aiQuestions = await generateQuizQuestions(language);
        setQuestions(aiQuestions);
      } catch (error) {
        console.warn("AI question generation failed, falling back to static questions.", error);
        setQuestions(QUIZ_QUESTIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [language]);
  
  // This effect handles badge unlocking and AI analysis when the quiz finishes.
  useEffect(() => {
    if (quizFinished) {
      if (score === questions.length && questions.length > 0) {
        unlockBadge('quiz-master');
      }

      const fetchAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        try {
          // Pass score, total questions, and language to the new service function
          const result = await generateQuizAnalysis(score, questions.length, language);
          setAnalysis(result);
        } catch (error) {
          console.error("Failed to get quiz analysis:", error);
          // Set an error message to display to the user
          setAnalysisError(t('analysisError'));
        } finally {
          setIsAnalyzing(false);
        }
      };

      fetchAnalysis();
    }
  }, [quizFinished, score, questions.length, language, unlockBadge, t]);


  if (isLoading) {
    return (
        <div className="max-w-xl mx-auto text-center">
             <Card className="p-8">
                <Spinner />
                <p className="mt-4 text-gray-600 font-semibold">{t('generatingQuiz')}</p>
             </Card>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuizFinished(false);
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const aiQuestions = await generateQuizQuestions(language);
        setQuestions(aiQuestions);
      } catch (error) {
        setQuestions(QUIZ_QUESTIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }

  if (quizFinished) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6">
        <Card className="p-8">
          <BrainCircuitIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('quizCompleted')}</h2>
          <p className="text-xl text-gray-600 mb-4">{t('quizScore', { score: score, total: questions.length })}</p>
          <button
            onClick={restartQuiz}
            className="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('playAgain')}
          </button>
        </Card>

        <Card className="p-6 text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{t('aiAnalysisTitle')}</h3>
            {isAnalyzing && (
                <div className="flex flex-col items-center gap-2">
                    <Spinner />
                    <p className="text-gray-600">{t('generatingAnalysis')}</p>
                </div>
            )}
            {analysisError && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg">{analysisError}</p>}
            {analysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-1">{t('performanceSummary')}</h4>
                  <p className="text-gray-600 text-sm">{analysis.performanceSummary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-1">{t('improvementAreas')}</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                      {analysis.improvementAreas.map((area, index) => (
                          <li key={index}>{area}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-1">{t('nextSteps')}</h4>
                  <p className="text-gray-600 text-sm">{analysis.nextSteps}</p>
                </div>
              </div>
            )}
        </Card>
      </div>
    );
  }
  
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('quizTitle')}</h2>
        <p className="text-center text-gray-500 mb-6">{t('quizDescription')}</p>
        <Card className="p-6">
            <div className="mb-4">
              <div className="mb-2">
                  <p className="text-gray-500 text-sm">{t('question')} {currentQuestionIndex + 1} of {questions.length}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">{currentQuestion.question}</h3>
            </div>
            <div className="space-y-3">
            {currentQuestion.options.map(option => {
                const isSelected = selectedAnswer === option;
                let buttonClass = 'border-gray-300 hover:bg-gray-100';
                if (showFeedback) {
                    if (option === currentQuestion.correctAnswer) {
                        buttonClass = 'bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500';
                    } else if (isSelected && !isCorrect) {
                        buttonClass = 'bg-red-100 border-red-500 text-red-800';
                    }
                } else if(isSelected) {
                     buttonClass = 'bg-blue-100 border-blue-500';
                }
                
                return (
                <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${buttonClass}`}
                >
                    {option}
                </button>
                );
            })}
            </div>
            {showFeedback && (
                <div className="mt-4 text-center">
                <p className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? t('correct') : t('incorrect')}
                </p>
                <button
                    onClick={handleNextQuestion}
                    className="mt-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                    {currentQuestionIndex < questions.length - 1 ? t('nextQuestion') : t('finishQuiz')}
                </button>
                </div>
            )}
        </Card>
    </div>
  );
};

export default Quiz;