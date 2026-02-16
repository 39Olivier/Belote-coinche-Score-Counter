
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Team, Round, NewRoundData } from './types';
import { AddRoundModal } from './components/AddRoundModal';
import { Scoreboard } from './components/Scoreboard';
import { Header } from './components/Header';
import { SetupGame } from './components/SetupGame';
import { PlusCircleIcon, InformationCircleIcon, BookOpenIcon } from './components/icons/Icons';
import { CardValueModal } from './components/CardValueModal';
import { RulesModal } from './components/RulesModal';

const App: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCardValueModalOpen, setIsCardValueModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [teamNames, setTeamNames] = useState<{ nous: string; eux: string } | null>(null);
  const [editingRound, setEditingRound] = useState<Round | null>(null);

  // Initialisation sécurisée
  useEffect(() => {
    try {
      const savedTeamNames = localStorage.getItem('beloteTeamNames');
      if (savedTeamNames) setTeamNames(JSON.parse(savedTeamNames));

      const savedRounds = localStorage.getItem('beloteRounds');
      if (savedRounds) {
        const parsed = JSON.parse(savedRounds);
        if (Array.isArray(parsed)) setRounds(parsed);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des données", e);
    }
  }, []);

  // Sauvegarde persistante
  useEffect(() => {
    if (teamNames) {
      localStorage.setItem('beloteRounds', JSON.stringify(rounds));
    }
  }, [rounds, teamNames]);

  // Gestion des classes d'animation éphémères
  useEffect(() => {
    const hasAnimation = rounds.some(r => r.animationClass);
    if (hasAnimation) {
      const timer = setTimeout(() => {
        setRounds(current => current.map(({ animationClass, ...r }) => r as Round));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [rounds]);

  const totals = useMemo(() => rounds.reduce(
    (acc, round) => ({ nous: acc.nous + round.nous, eux: acc.eux + round.eux }),
    { nous: 0, eux: 0 }
  ), [rounds]);

  const calculateRoundScores = useCallback((data: NewRoundData) => {
    if (!teamNames) return { roundNous: 0, roundEux: 0, details: '' };

    const { bidder, contract, suit, scoreMade, checkedOff, overridden } = data;
    let multiplier = 1;
    if (checkedOff) multiplier = 2;
    if (overridden) multiplier = 4;

    const baseScore = contract * multiplier;
    const isSuccess = scoreMade >= contract;
    const bidderName = bidder === Team.Nous ? teamNames.nous : teamNames.eux;
    
    let roundNous = 0;
    let roundEux = 0;
    let status = isSuccess ? "réussi" : "chuté";

    if (isSuccess) {
      if (bidder === Team.Nous) roundNous = baseScore;
      else roundEux = baseScore;
    } else {
      // En cas de chute, c'est l'autre équipe qui marque les points du contrat
      if (bidder === Team.Nous) roundEux = baseScore;
      else roundNous = baseScore;
    }

    const multiplierLabel = overridden ? " (Surcoinché)" : (checkedOff ? " (Coinché)" : "");
    const details = `Contrat de ${contract}${multiplierLabel} en ${suit} ${status} par ${bidderName}.`;

    return { roundNous, roundEux, details };
  }, [teamNames]);

  const handleSaveRound = (data: NewRoundData, id?: number) => {
    const { roundNous, roundEux, details } = calculateRoundScores(data);
    
    if (id) {
      setRounds(prev => prev.map(r => r.id === id ? { ...r, ...data, nous: roundNous, eux: roundEux, details } : r));
    } else {
      const newRound: Round = {
        id: Date.now(),
        nous: roundNous,
        eux: roundEux,
        details,
        ...data,
        animationClass: 'animate-slide-in-down',
      };
      setRounds(prev => [newRound, ...prev]);
    }
    setIsModalOpen(false);
    setEditingRound(null);
  };
  
  const handleNewGame = () => {
    if (window.confirm("Commencer une nouvelle partie ? Tous les scores seront effacés.")) {
      setRounds([]);
      localStorage.removeItem('beloteRounds');
    }
  };

  const handleStartGame = (names: { nous: string; eux: string }) => {
    setTeamNames(names);
    setRounds([]);
    localStorage.setItem('beloteTeamNames', JSON.stringify(names));
    localStorage.removeItem('beloteRounds');
  };

  const winner = useMemo(() => {
    const threshold = 1000;
    if (totals.nous >= threshold && totals.nous > totals.eux) return Team.Nous;
    if (totals.eux >= threshold && totals.eux > totals.nous) return Team.Eux;
    return null;
  }, [totals]);

  if (!teamNames) return <SetupGame onStartGame={handleStartGame} />;

  const winnerName = winner ? (winner === Team.Nous ? teamNames.nous : teamNames.eux) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        <Header onNewGame={handleNewGame} />

        <main>
          <Scoreboard 
            totals={totals} 
            rounds={rounds} 
            winner={winner} 
            teamNames={teamNames}
            onDeleteRound={(id) => setRounds(prev => prev.filter(r => r.id !== id))}
            onStartEdit={(r) => { setEditingRound(r); setIsModalOpen(true); }}
          />

          {winnerName && (
             <div className="mt-8 text-center p-8 bg-green-900/40 border-2 border-green-500 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
                <h2 className="text-4xl font-black text-green-300">🏆 {winnerName} GAGNE !</h2>
                <p className="mt-2 text-green-200/80 font-medium">Félicitations pour cette belle partie.</p>
             </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
             <button
              onClick={() => setIsModalOpen(true)}
              disabled={!!winner}
              className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircleIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Ajouter un tour
            </button>
            <button
              onClick={() => setIsCardValueModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <InformationCircleIcon className="w-6 h-6" />
              <span className="hidden sm:inline">Valeur cartes</span>
            </button>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <BookOpenIcon className="w-6 h-6" />
              <span className="hidden sm:inline">Règles</span>
            </button>
          </div>
        </main>

        <footer className="text-center mt-16 pb-8 text-slate-500 text-sm font-medium tracking-wide">
          <p>© Olivier74 - Belote Coinchée v1.1 - 2025</p>
        </footer>
      </div>

      {isModalOpen && (
        <AddRoundModal
          onClose={() => { setIsModalOpen(false); setEditingRound(null); }}
          onSave={handleSaveRound}
          teamNames={teamNames}
          roundToEdit={editingRound}
        />
      )}

      {isCardValueModalOpen && <CardValueModal onClose={() => setIsCardValueModalOpen(false)} />}
      {isRulesModalOpen && <RulesModal onClose={() => setIsRulesModalOpen(false)} />}
    </div>
  );
};

export default App;
