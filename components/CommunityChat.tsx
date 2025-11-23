import React, { useState, useEffect, useRef } from 'react';
import { Community, CommunityMessage, CommunityMember } from '../types.ts';
import { useTranslation } from '../i18n/useTranslation.ts';
import { SendIcon } from './common/Icons.tsx';

interface CommunityChatProps {
    community: Community;
    messages: CommunityMessage[];
    currentUser: CommunityMember;
    onSendMessage: (communityId: string, text: string) => Promise<{ success: boolean; reason?: string }>;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ community, messages, currentUser, onSendMessage }) => {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isSending) {
            setIsSending(true);
            setSendError(null);
            const result = await onSendMessage(community.id, input.trim());
            if (result.success) {
                setInput('');
            } else {
                setSendError(result.reason || "Your message was blocked by moderation.");
                // Clear error after a few seconds
                setTimeout(() => setSendError(null), 4000);
            }
            setIsSending(false);
        }
    };

    const initialMessage = t('chatWelcomeMessage', {name: community.name});

    return (
        <div className="h-[75vh] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden">
            <div className="p-3 border-b bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">{community.name}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100 space-y-4">
                {/* Welcome Message */}
                <div className="text-center my-2">
                    <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{initialMessage}</span>
                </div>

                {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUser.userId;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-sm rounded-lg px-3 py-2 ${isCurrentUser ? 'bg-green-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                {!isCurrentUser && <p className="text-xs font-bold text-blue-600">{msg.senderName}</p>}
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('typeMessage')}
                        className="flex-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2"
                        disabled={isSending}
                    />
                    <button type="submit" disabled={!input.trim() || isSending} className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center w-11 h-11">
                        {isSending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SendIcon className="w-5 h-5" />}
                    </button>
                </form>
                 {sendError && <p className="text-xs text-red-500 text-center mt-2">{sendError}</p>}
            </div>
        </div>
    );
};

export default CommunityChat;