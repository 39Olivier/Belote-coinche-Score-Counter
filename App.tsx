import React, { useState, useMemo, useEffect } from 'react';
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

  useEffect(() => {
    try {
      const savedTeamNames = localStorage.getItem('beloteTeamNames');
      if (savedTeamNames) {
        setTeamNames(JSON.parse(savedTeamNames));
      }
      const savedRounds = localStorage.getItem('beloteRounds');
      if (savedRounds) {
        const parsedRounds = JSON.parse(savedRounds);
        // Data migration: remove beloteHolder from old rounds
        const cleanedRounds = parsedRounds.map((r: any) => {
          const { beloteHolder, ...rest } = r;
          return rest;
        });
        setRounds(cleanedRounds);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (teamNames) {
      localStorage.setItem('beloteRounds', JSON.stringify(rounds));
    }
  }, [rounds, teamNames]);

  useEffect(() => {
    const roundsWithAnimation = rounds.filter(r => 'animationClass' in r);
    if (roundsWithAnimation.length > 0) {
      const timer = setTimeout(() => {
        setRounds(currentRounds => currentRounds.map(r => {
          if ('animationClass' in r) {
            const { animationClass, ...rest } = r;
            return rest;
          }
          return r;
        }));
      }, 500); // Animation is 400ms, 500ms is safe
      return () => clearTimeout(timer);
    }
  }, [rounds]);


  const totals = useMemo(() => {
    return rounds.reduce(
      (acc, round) => {
        acc.nous += round.nous;
        acc.eux += round.eux;
        return acc;
      },
      { nous: 0, eux: 0 }
    );
  }, [rounds]);

  const calculateRoundScores = (data: NewRoundData) => {
    const { bidder, contract, suit, scoreMade, opponentScore } = data;
    let roundNous = 0;
    let roundEux = 0;
    let details = '';
    const bidderName = bidder === Team.Nous ? teamNames!.nous : teamNames!.eux;

    const otherTeam = bidder === Team.Nous ? Team.Eux : Team.Nous;

    if (contract === 250 || contract === 500) {
      // Keep existing logic for Capot/Générale since score entry is not manual.
      const contractSucceeded = scoreMade === contract;
      const contractTypeName = contract === 250 ? 'Capot' : 'Générale';
      if (contractSucceeded) {
        details = `${contractTypeName} (${suit}) réussi par ${bidderName}`;
        if (bidder === Team.Nous) roundNous += contract; else roundEux += contract;
      } else {
        details = `${contractTypeName} (${suit}) chuté par ${bidderName}`;
        if (otherTeam === Team.Nous) roundNous += contract; else roundEux += contract;
      }
    } else {
      // For regular contracts, use the manually entered scores directly as the round scores.
      if (bidder === Team.Nous) {
        roundNous = scoreMade;
        roundEux = opponentScore;
      } else {
        roundEux = scoreMade;
        roundNous = opponentScore;
      }
      
      // Update the details string to reflect whether the contract was made or not.
      const contractMade = scoreMade >= contract;
      if (contractMade) {
        details = `Contrat de ${contract} ${suit} réussi par ${bidderName} (${scoreMade} pts)`;
      } else {
        details = `Contrat de ${contract} ${suit} chuté par ${bidderName} (${scoreMade} pts)`;
      }
    }
    return { roundNous, roundEux, details };
  };

  const handleSaveRound = (data: NewRoundData, id?: number) => {
    const { roundNous, roundEux, details } = calculateRoundScores(data);
    
    if (id) {
      // Update existing round
      setRounds(prev => prev.map(r => r.id === id ? {
        ...r,
        ...data,
        nous: roundNous,
        eux: roundEux,
        details,
      } : r));
    } else {
      // Add new round
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
    const currentTeamNames = localStorage.getItem('beloteTeamNames');
    setTeamNames(null);
    setRounds([]);
    localStorage.removeItem('beloteRounds');
    if (currentTeamNames) {
      localStorage.setItem('beloteTeamNames', currentTeamNames);
    }
  };

  const handleStartGame = (names: { nous: string; eux: string }) => {
    setTeamNames(names);
    setRounds([]);
    localStorage.setItem('beloteTeamNames', JSON.stringify(names));
    localStorage.removeItem('beloteRounds');
  };

  const handleDeleteRound = (roundId: number) => {
    setRounds(prev => prev.filter(r => r.id !== roundId));
  };

  const handleStartEdit = (round: Round) => {
    setEditingRound(round);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRound(null);
  }

  const winner = useMemo(() => {
    if (totals.nous >= 1000 && totals.nous > totals.eux) return Team.Nous;
    if (totals.eux >= 1000 && totals.eux > totals.nous) return Team.Eux;
    return null;
  }, [totals]);

  if (!teamNames) {
    return <SetupGame onStartGame={handleStartGame} />;
  }

  const winnerName = winner ? (winner === Team.Nous ? teamNames.nous : teamNames.eux) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header onNewGame={handleNewGame} />

        <main>
          <Scoreboard 
            totals={totals} 
            rounds={rounds} 
            winner={winner} 
            teamNames={teamNames}
            onDeleteRound={handleDeleteRound}
            onStartEdit={handleStartEdit}
          />

          {winnerName && (
             <div className="mt-8 text-center p-6 bg-green-900/50 border border-green-500 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-green-300 animate-pulse">{winnerName} a gagné la partie !</h2>
             </div>
          )}

          <div className="mt-8 flex justify-center items-center space-x-2 sm:space-x-4">
             <button
              onClick={() => setIsModalOpen(true)}
              disabled={!!winner}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:scale-100"
            >
              <PlusCircleIcon />
              Ajouter un tour
            </button>
            <button
              onClick={() => setIsCardValueModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              title="Valeur des cartes"
            >
              <InformationCircleIcon />
              <span className="hidden sm:inline">Valeur cartes</span>
            </button>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              title="Règles du jeu"
            >
              <BookOpenIcon />
              <span className="hidden sm:inline">Règles</span>
            </button>
          </div>
        </main>

        <footer className="text-center mt-12 text-red-500 text-base font-bold">
          <p>(©)Olivier74 - Version 1.00 - octobre 2025</p>
        </footer>
      </div>

      {isModalOpen && (
        <AddRoundModal
          onClose={handleCloseModal}
          onSave={handleSaveRound}
          teamNames={teamNames}
          roundToEdit={editingRound}
        />
      )}

      {isCardValueModalOpen && (
        <CardValueModal onClose={() => setIsCardValueModalOpen(false)} />
      )}

      {isRulesModalOpen && (
        <RulesModal onClose={() => setIsRulesModalOpen(false)} />
      )}
    </div>
  );
};

export default App;