import React, { useState, useEffect } from 'react';
import Card from '../common/Card.tsx';
import { useTranslation } from '../../i18n/useTranslation.ts';
import { generateSegregationAnalysis } from '../../services/geminiService.ts';
import { SegregationAnalysis } from '../../types.ts';
import Spinner from '../common/Spinner.tsx';
import { PlayCircleIcon } from '../common/Icons.tsx';

interface SegregationMasterclassProps {
  addPoints: (points: number) => void;
}

interface Question {
  item: string;
  image: string;
  correctAnswer: string;
}

const questions: Question[] = [
  { item: 'Apple Core', image: '🍎', correctAnswer: 'Wet Waste' },
  { item: 'Plastic Bottle', image: '🍾', correctAnswer: 'Dry Waste' },
  { item: 'Used Battery', image: '🔋', correctAnswer: 'Hazardous' },
  { item: 'Newspaper', image: '📰', correctAnswer: 'Dry Waste' },
  { item: 'Vegetable Peels', image: '🥬', correctAnswer: 'Wet Waste' },
];

const options = ['Wet Waste', 'Dry Waste', 'Hazardous'];

const SegregationMasterclass: React.FC<SegregationMasterclassProps> = ({ addPoints }) => {
  const { t, language } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([]);

  // AI Analysis State
  const [analysis, setAnalysis] = useState<SegregationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
      if (isFinished) {
          const fetchAnalysis = async () => {
              setIsAnalyzing(true);
              setAnalysis(null);
              setAnalysisError(null);
              try {
                  const incorrectItems = incorrectAnswers.map(q => q.item);
                  const result = await generateSegregationAnalysis(score, questions.length * 10, incorrectItems, language);
                  setAnalysis(result);
              } catch (error) {
                  console.error("Failed to get segregation analysis:", error);
                  setAnalysisError(t('segregationAnalysisError'));
              } finally {
                  setIsAnalyzing(false);
              }
          };
          fetchAnalysis();
      }
  }, [isFinished, score, incorrectAnswers, language, t]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 10);
      addPoints(10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
      setIncorrectAnswers(prev => [...prev, questions[currentQuestionIndex]]);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const restartGame = () => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setFeedback(null);
      setIsFinished(false);
      setIncorrectAnswers([]);
      setAnalysis(null);
      setIsAnalyzing(false);
      setAnalysisError(null);
  }

  if (isFinished) {
      return (
          <div className="space-y-6">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">{t('segregationComplete')}</h2>
              <p className="text-gray-600 mb-4">{t('segregationFinalScore', {score: score})}</p>
              <button
                  onClick={restartGame}
                  className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                  {t('segregationRestart')}
              </button>
            </Card>

            <Card className="p-6 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{t('aiSegregationAnalysisTitle')}</h3>
              {isAnalyzing && (
                  <div className="flex flex-col items-center gap-2">
                      <Spinner />
                      <p className="text-gray-600">{t('generatingSegregationAnalysis')}</p>
                  </div>
              )}
              {analysisError && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg">{analysisError}</p>}
              {analysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-1">{t('performanceSummary')}</h4>
                    <p className="text-gray-600 text-sm italic">"{analysis.performanceSummary}"</p>
                  </div>
                  {analysis.improvementTips.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-2">{t('improvementTips')}</h4>
                      <ul className="space-y-2">
                          {analysis.improvementTips.map((tip, index) => (
                              <li key={index} className="p-2 bg-yellow-50/50 border-l-4 border-yellow-400 rounded-r-md">
                                  <p className="font-semibold text-yellow-900">{tip.item}</p>
                                  <p className="text-sm text-yellow-800">{tip.tip}</p>
                              </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  {analysis.suggestedVideos.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 tracking-wide uppercase text-xs mb-2">{t('suggestedVideos')}</h4>
                        <ul className="space-y-2">
                            {analysis.suggestedVideos.map((videoTitle, index) => (
                                <li key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-md text-sm text-gray-700 cursor-pointer hover:bg-gray-200">
                                  <PlayCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                  <span>{videoTitle}</span>
                                </li>
                            ))}
                        </ul>
                      </div>
                  )}
                </div>
              )}
          </Card>
        </div>
      );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('segregationTitle')}</h2>
      <p className="text-center text-gray-500 mb-6">{t('segregationChallenge')}</p>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.item}</h3>
          <span className="font-bold text-lg text-green-700">{t('segregationScore', { score })}</span>
        </div>
        <div className="flex justify-center items-center h-48 my-8 bg-gray-100 rounded-lg p-6">
            <span className="text-7xl">{currentQuestion.image}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
              className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
            >
              {option}
            </button>
          ))}
        </div>
        {feedback && (
          <div className={`mt-6 text-center text-xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback === 'correct' ? t('segregationCorrect') : t('segregationIncorrect')}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SegregationMasterclass;