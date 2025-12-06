import React, { useState, useEffect, useRef } from 'react';
import { Team, Round, Suit } from '../types';
import { PencilIcon, TrashIcon } from './icons/Icons';

interface ScoreboardProps {
  totals: { nous: number; eux: number };
  rounds: Round[];
  winner: Team | null;
  teamNames: { nous: string; eux: string };
  onDeleteRound: (roundId: number) => void;
  onStartEdit: (round: Round) => void;
}

const SuitDisplay: React.FC<{ suit: Suit }> = ({ suit }) => {
    const isRed = suit === Suit.Heart || suit === Suit.Diamond;
    const colorClass = isRed ? 'text-red-500' : 'text-slate-300';
    return <span className={`text-xl ${colorClass}`}>{suit}</span>
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ totals, rounds, winner, teamNames, onDeleteRound, onStartEdit }) => {
  const [animateNous, setAnimateNous] = useState(false);
  const [animateEux, setAnimateEux] = useState(false);
  const isInitialNous = useRef(true);
  const isInitialEux = useRef(true);

  useEffect(() => {
    if (isInitialNous.current) {
      isInitialNous.current = false;
      return;
    }
    setAnimateNous(true);
    const timer = setTimeout(() => setAnimateNous(false), 500);
    return () => clearTimeout(timer);
  }, [totals.nous]);

  useEffect(() => {
    if (isInitialEux.current) {
      isInitialEux.current = false;
      return;
    }
    setAnimateEux(true);
    const timer = setTimeout(() => setAnimateEux(false), 500);
    return () => clearTimeout(timer);
  }, [totals.eux]);

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
      {/* Total Scores */}
      <div className="grid grid-cols-2 text-center">
        <div className={`p-6 ${winner === Team.Nous ? 'bg-green-800/50' : ''}`}>
          <h2 className="text-2xl font-semibold text-slate-400 uppercase">{teamNames.nous}</h2>
          <p className={`text-5xl font-bold text-cyan-400 tracking-wider mt-2 ${animateNous ? 'animate-score-pop' : ''}`}>{totals.nous}</p>
        </div>
        <div className={`p-6 border-l border-slate-700 ${winner === Team.Eux ? 'bg-green-800/50' : ''}`}>
          <h2 className="text-2xl font-semibold text-slate-400 uppercase">{teamNames.eux}</h2>
          <p className={`text-5xl font-bold text-amber-400 tracking-wider mt-2 ${animateEux ? 'animate-score-pop' : ''}`}>{totals.eux}</p>
        </div>
      </div>

      {/* Round History */}
      <div className="bg-slate-900/70 p-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-center text-slate-400 mb-4 sticky top-0 bg-slate-900/70 py-2">Historique des tours</h3>
        {rounds.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Aucun tour joué pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {rounds.map((round) => (
              <li
                key={round.id}
                className={`group relative bg-slate-800 rounded-lg p-3 shadow-md ${round.animationClass ?? ''}`}
              >
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-cyan-400 w-1/4 text-center">{round.nous}</span>
                   <div className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md w-1/2 text-center text-base ${
                        round.bidder === Team.Nous ? 'bg-cyan-900/50 text-cyan-300' : 'bg-amber-900/50 text-amber-300'
                    }`}>
                        {round.checkedOff && <span className="text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full" title="Coinché">C</span>}
                        {round.overridden && <span className="text-xs font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full" title="Surcoinché">S</span>}
                        <span className="font-semibold">{round.contract === 500 ? 'Générale' : round.contract === 250 ? 'Capot' : round.contract}</span>
                        <SuitDisplay suit={round.suit} />
                    </div>
                  <span className="font-bold text-amber-400 w-1/4 text-center">{round.eux}</span>
                </div>
                <p className="text-center text-sm text-slate-400 mt-1 truncate" title={round.details}>{round.details}</p>
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => onStartEdit(round)} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600" title="Modifier le tour">
                        <PencilIcon className="w-4 h-4 text-slate-300 pointer-events-none" />
                    </button>
                     <button onClick={() => onDeleteRound(round.id)} className="p-1 rounded-full bg-slate-700 hover:bg-red-800" title="Supprimer le tour">
                        <TrashIcon className="w-4 h-4 text-slate-300 pointer-events-none" />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};