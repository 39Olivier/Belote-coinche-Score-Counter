import React, { useState, useEffect } from 'react';

interface SetupGameProps {
  onStartGame: (teamNames: { nous: string; eux: string }) => void;
}

const randomNames = [
  'Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 
  'Ivan', 'Judy', 'Léo', 'Mia', 'Noa', 'Eli', 'Olivia', 'Hugo', 'Chloé', 'Louis'
];

const getUniqueRandomNames = (count: number): string[] => {
  const shuffled = [...randomNames].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const SetupGame: React.FC<SetupGameProps> = ({ onStartGame }) => {
  const [nousP1, setNousP1] = useState('');
  const [nousP2, setNousP2] = useState('');
  const [euxP1, setEuxP1] = useState('');
  const [euxP2, setEuxP2] = useState('');

  useEffect(() => {
    try {
      const savedTeamNames = localStorage.getItem('beloteTeamNames');
      if (savedTeamNames) {
        const parsedNames = JSON.parse(savedTeamNames);
        const [savedNousP1 = '', savedNousP2 = ''] = parsedNames.nous.split(' & ');
        const [savedEuxP1 = '', savedEuxP2 = ''] = parsedNames.eux.split(' & ');
        setNousP1(savedNousP1);
        setNousP2(savedNousP2);
        setEuxP1(savedEuxP1);
        setEuxP2(savedEuxP2);
      } else {
        const [name1, name2, name3, name4] = getUniqueRandomNames(4);
        setNousP1(name1);
        setNousP2(name2);
        setEuxP1(name3);
        setEuxP2(name4);
      }
    } catch (error) {
      console.error("Failed to process team names, falling back to random.", error);
      const [name1, name2, name3, name4] = getUniqueRandomNames(4);
      setNousP1(name1);
      setNousP2(name2);
      setEuxP1(name3);
      setEuxP2(name4);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nousName = `${nousP1.trim()} & ${nousP2.trim()}`;
    const euxName = `${euxP1.trim()} & ${euxP2.trim()}`;
    onStartGame({ nous: nousName, eux: euxName });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-700 p-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 mb-6">
          Nouvelle Partie de Belote
        </h1>
        <p className="text-slate-400 mb-8">Entrez les prénoms des joueurs pour commencer.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border-2 border-cyan-700/50 p-4 rounded-lg">
            <legend className="px-2 font-semibold text-cyan-400">Équipe 1</legend>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Prénom Joueur 1"
                value={nousP1}
                onChange={(e) => setNousP1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                required
              />
              <input
                type="text"
                placeholder="Prénom Joueur 2"
                value={nousP2}
                onChange={(e) => setNousP2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                required
              />
            </div>
          </fieldset>

          <fieldset className="border-2 border-amber-700/50 p-4 rounded-lg">
            <legend className="px-2 font-semibold text-amber-400">Équipe 2</legend>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Prénom Joueur 3"
                value={euxP1}
                onChange={(e) => setEuxP1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                required
              />
              <input
                type="text"
                placeholder="Prénom Joueur 4"
                value={euxP2}
                onChange={(e) => setEuxP2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                required
              />
            </div>
          </fieldset>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 mt-4"
          >
            Démarrer la partie
          </button>
        </form>
      </div>
    </div>
  );
};