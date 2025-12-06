import React from 'react';
import { SpadeIcon, HeartIcon, DiamondIcon, ClubIcon } from './icons/Icons';

interface HeaderProps {
    onNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewGame }) => {
    return (
        <header className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-700">
            <div className="flex items-center gap-3">
                <div className="flex text-2xl gap-1">
                    <SpadeIcon className="text-gray-300" />
                    <HeartIcon className="text-red-500" />
                    <DiamondIcon className="text-red-500" />
                    <ClubIcon className="text-gray-300" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">
                        Compteur de Belote Coinchée
                    </h1>
                   
                </div>
            </div>
            <button
                onClick={onNewGame}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                title="Nouvelle partie"
            >
                <span className="text-lg leading-none" aria-hidden="true">
                    <span className="text-slate-200">♠</span>
                    <span className="text-red-300">♥</span>
                    <span className="text-red-300">♦</span>
                    <span className="text-slate-200">♣</span>
                </span>
                <span className="hidden sm:inline">Nouvelle Partie</span>
            </button>
        </header>
    );
};
