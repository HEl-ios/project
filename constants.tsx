import React from 'react';
import { QuizQuestion, Badge } from './types.ts';
import { RecycleIcon, BrainCircuitIcon, AlertTriangleIcon, MessageSquareIcon, StarIcon, UserIcon, DollarSignIcon, BriefcaseIcon } from './components/common/Icons.tsx';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which of the following is considered 'wet waste'?",
    options: ["Plastic bottle", "Vegetable peels", "Newspaper", "Glass jar"],
    correctAnswer: "Vegetable peels",
  },
  {
    question: "What does the 'three arrows' symbol on plastic items mean?",
    options: ["It's made from recycled material", "It's recyclable", "It's biodegradable", "It's hazardous"],
    correctAnswer: "It's recyclable",
  },
  {
    question: "How should you dispose of used batteries?",
    options: ["Throw them in the regular trash", "Bury them in the garden", "Take them to a designated e-waste collection point", "Mix with wet waste"],
    correctAnswer: "Take them to a designated e-waste collection point",
  },
  {
    question: "What is composting?",
    options: ["Burning waste", "A process to recycle plastic", "A natural process that turns organic waste into nutrient-rich soil", "A method for cleaning water"],
    correctAnswer: "A natural process that turns organic waste into nutrient-rich soil",
  },
  {
    question: "Which of these is a major cause of landfill overflow?",
    options: ["Properly sorted recyclables", "Single-use plastics", "Composted food scraps", "Reused materials"],
    correctAnswer: "Single-use plastics",
  }
];

export const BADGE_DEFINITIONS: Badge[] = [
  {
    slug: 'first-scan',
    name: "First Scan!",
    description: "You classified your first item. Welcome aboard!",
    icon: <RecycleIcon className="w-8 h-8 text-green-500" />,
    points: 50,
  },
  {
    slug: 'novice-recycler',
    name: "Novice Recycler",
    description: "Classified 5 items correctly. Keep it up!",
    icon: <StarIcon className="w-8 h-8 text-yellow-500" />,
    points: 100,
  },
  {
    slug: 'quiz-master',
    name: "Quiz Master",
    description: "You aced the waste management quiz!",
    icon: <BrainCircuitIcon className="w-8 h-8 text-blue-500" />,
    points: 150,
  },
  {
    slug: 'eco-reporter',
    name: "Eco Reporter",
    description: "You reported an environmental issue. Thank you!",
    icon: <AlertTriangleIcon className="w-8 h-8 text-red-500" />,
    points: 100,
  },
  {
    slug: 'community-helper',
    name: "Community Helper",
    description: "Reported 3 issues. Thanks for your dedication!",
    icon: <UserIcon className="w-8 h-8 text-cyan-500" />,
    points: 200,
  },
  {
    slug: 'chat-champ',
    name: "Chat Champ",
    description: "Used the AI chatbot to learn something new.",
    icon: <MessageSquareIcon className="w-8 h-8 text-purple-500" />,
    points: 0,
  },
  {
    slug: 'scrap-seller',
    name: "First Sale!",
    description: "You sold your first batch of recyclables. Ka-ching!",
    icon: <DollarSignIcon className="w-8 h-8 text-amber-500" />,
    points: 150,
  },
  {
    slug: 'corporate-citizen',
    name: "Corporate Citizen",
    description: "Scheduled your first bulk waste pickup. Leading by example!",
    icon: <BriefcaseIcon className="w-8 h-8 text-indigo-500" />,
    points: 250,
  }
];
