import React, { useState } from 'react';
import { Cat, User, CatStatus, CampusZone } from '../types';
import { ApiService } from '../services/api';
import { ArrowLeft, MapPin, Heart, Utensils, Info, CheckCircle } from 'lucide-react';

interface CatDetailProps {
    cat: Cat;
    user: User;
    onBack: () => void;
    onUpdate: () => void; // Trigger parent refresh
}

export const CatDetail: React.FC<CatDetailProps> = ({ cat, user, onBack, onUpdate }) => {
    const [feedingAmount, setFeedingAmount] = useState(250);
    const [logging, setLogging] = useState(false);
    const [suggestName, setSuggestName] = useState('');
    const [voting, setVoting] = useState(false);

    const handleFeed = async () => {
        setLogging(true);
        await ApiService.logFeeding(cat.id, feedingAmount, user);
        onUpdate();
        setLogging(false);
        alert(`${cat.name} için mama kaydı alındı! Teşekkürler.`);
    };

    // Calculate top name
    const sortedNames = Object.entries(cat.votes || {}).sort((a, b) => (b[1] as number) - (a[1] as number));

    const hasVoted = (cat.votedUserIds || []).includes(user.id);

    const handleVote = async (name: string) => {
        if (hasVoted) return;

        setVoting(true);
        try {
            await ApiService.voteForCatName(cat.id, name, user.id);
            alert(`"${name}" ismine oy verdiniz.`);
            onUpdate();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setVoting(false);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="relative h-64 sm:h-80 bg-slate-900">
                <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className={`w-full h-full object-cover opacity-90 ${cat.status === CatStatus.DECEASED ? 'grayscale' : ''}`}
                />
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h1 className="text-3xl font-bold text-white mb-1">{cat.name}</h1>
                    <div className="flex items-center text-slate-300 text-sm">
                        <MapPin size={16} className="mr-1" />
                        {cat.zone}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Status Info */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="text-xs text-slate-500 dark:text-slate-300 uppercase font-bold tracking-wider">Durum</span>
                        <div className="mt-1 font-semibold text-slate-800 dark:text-white">
                            {cat.status === CatStatus.ALIVE ? 'Kampüste Yaşıyor' : cat.status === CatStatus.ADOPTED ? 'Sahiplendirildi 🏠' : 'Melek Oldu 🕊️'}
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                        <span className="text-xs text-slate-500 dark:text-slate-300 uppercase font-bold tracking-wider">Renk</span>
                        <div className="mt-1 font-semibold text-slate-800 dark:text-white">{cat.color}</div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-2">
                        <Info size={18} className="mr-2 text-amber-500" />
                        Hakkında
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{cat.description}</p>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Belirgin Özellikler:</span> {cat.features}
                    </div>
                </div>

                {/* Name Voting System */}
                <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <h3 className="font-bold text-purple-900 dark:text-purple-300 flex items-center mb-4">
                        <Heart size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
                        İsim Oylaması
                        {hasVoted && (
                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                                <CheckCircle size={12} className="mr-1" />
                                Oy Kullandınız
                            </span>
                        )}
                    </h3>

                    <div className="space-y-3 mb-4">
                        {sortedNames.length > 0 ? sortedNames.map(([name, count], idx) => (
                            <div key={name} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-transparent dark:border-slate-700">
                                <div className="flex items-center">
                                    <span className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full mr-3">
                                        {idx + 1}
                                    </span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{count} oy</span>
                                    <button
                                        onClick={() => handleVote(name)}
                                        disabled={voting || hasVoted}
                                        className={`text-xs px-3 py-1 rounded font-medium transition-colors ${hasVoted
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                                : 'bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300'
                                            }`}
                                    >
                                        Oy Ver
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">Henüz isim önerisi yapılmamış.</div>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Yeni isim öner..."
                            className="flex-1 border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            value={suggestName}
                            onChange={(e) => setSuggestName(e.target.value)}
                        />
                        <button
                            disabled={!suggestName || hasVoted}
                            onClick={() => { handleVote(suggestName); setSuggestName(''); }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Öner
                        </button>
                    </div>
                </div>

                {/* Feeding Interaction */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <h3 className="font-bold text-yellow-900 dark:text-yellow-500 flex items-center mb-4">
                        <Utensils size={18} className="mr-2 text-yellow-600 dark:text-yellow-500" />
                        Beslenme Kaydı
                    </h3>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                            Mama Bırakıyorum: <span className="font-bold">{feedingAmount}g</span>
                        </label>
                        <input
                            type="range"
                            min="250"
                            max="2500"
                            step="250"
                            value={feedingAmount}
                            onChange={(e) => setFeedingAmount(Number(e.target.value))}
                            className="w-full h-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                        />
                        <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            <span>250g</span>
                            <span>2.5kg</span>
                        </div>
                    </div>

                    <button
                        onClick={handleFeed}
                        disabled={logging}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center"
                    >
                        {logging ? 'Kaydediliyor...' : 'Mama Bıraktım Kaydet'}
                    </button>
                </div>

                {/* History Log */}
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Son Hareketler</h3>
                    <div className="space-y-4">
                        {(!cat.feedingLogs || cat.feedingLogs.length === 0) ? (
                            <div className="text-slate-500 dark:text-slate-400 text-sm">Henüz kayıt yok.</div>
                        ) : (
                            cat.feedingLogs.slice().reverse().slice(0, 5).map(log => (
                                <div key={log.id} className="flex items-start">
                                    <div className="w-8 flex flex-col items-center mr-3">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    </div>
                                    <div className="pb-4">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.userName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {log.amountGrams}g mama bıraktı • {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};