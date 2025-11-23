import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChat } from '../services/geminiService.ts';
import type { Chat } from "@google/genai";
import { BadgeSlug } from '../types.ts';
import Card from './common/Card.tsx';
import Spinner from './common/Spinner.tsx';
import { useTranslation } from '../i18n/useTranslation.ts';
import { UserIcon, MessageSquareIcon as BotIcon, MicrophoneIcon } from './common/Icons.tsx';
import useVoiceRecognition from '../hooks/useVoiceRecognition.ts';

interface ChatbotProps {
    unlockBadge: (slug: BadgeSlug) => void;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

// FIX: Securely render markdown-like text without dangerouslySetInnerHTML
const SafeMessageRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');

    return (
        <div className="text-sm">
            {lines.map((line, index) => {
                // Handle list items
                if (line.trim().startsWith('* ')) {
                    return <li key={index} className="ml-5 list-disc">{line.trim().substring(2)}</li>;
                }

                // Handle bold text
                const segments = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);

                return (
                    <p key={index} className="my-1">
                        {segments.map((segment, segIndex) => {
                            if (segment.startsWith('**') && segment.endsWith('**')) {
                                return <strong key={segIndex}>{segment.slice(2, -2)}</strong>;
                            }
                            return <span key={segIndex}>{segment}</span>;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ unlockBadge }) => {
    const { t, language } = useTranslation();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChatted, setHasChatted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isListening, transcript, startListening, stopListening, isSupported, error: voiceError } = useVoiceRecognition(language);

    useEffect(() => {
        setChat(createChat(language));
        setMessages([{ sender: 'bot', text: t('chatbotWelcome') }]);
    }, [language, t]);

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            let botResponse = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]); // Add placeholder

            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = botResponse;
                    return newMessages;
                });
            }

            if (!hasChatted) {
                unlockBadge('chat-champ');
                setHasChatted(true);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: t('chatbotError') }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, chat, isLoading, hasChatted, unlockBadge, t]);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t('chatbotTitle')}</h2>
            <p className="text-center text-gray-500 mb-6">{t('chatbotDescription')}</p>
            <Card className="h-[70vh] flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <BotIcon className="w-5 h-5 text-gray-600"/>
                                </div>
                            )}
                            <div className={`max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <SafeMessageRenderer text={msg.text} />
                            </div>
                             {msg.sender === 'user' && (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-5 h-5 text-green-700"/>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1]?.sender === 'user' && (
                         <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5 text-gray-600"/>
                            </div>
                            <div className="max-w-sm rounded-lg px-4 py-2 bg-gray-200 text-gray-800 rounded-bl-none">
                                 <Spinner/>
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? t('voiceInputListening') : t('typeMessage')}
                                className="block w-full rounded-full border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2.5 pr-12"
                                disabled={isLoading}
                            />
                            {isSupported && (
                                <button 
                                    type="button" 
                                    onClick={isListening ? stopListening : startListening}
                                    className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors ${isListening ? 'text-green-500' : 'text-gray-500 hover:text-green-600'}`}
                                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                                >
                                    <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 text-white font-bold p-3 rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400">
                            {/* FIX: Corrected a typo in the viewBox attribute which was causing a parsing error. */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </form>
                    {voiceError && <p className="text-xs text-red-500 text-center mt-2">{voiceError}</p>}
                </div>
            </Card>
        </div>
    );
};

export default Chatbot;