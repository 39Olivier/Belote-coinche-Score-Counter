import React, { useState, useEffect } from 'react';
import { Team, NewRoundData, Suit, Round } from '../types';
import { XMarkIcon } from './icons/Icons';

interface AddRoundModalProps {
  onClose: () => void;
  onSave: (data: NewRoundData, id?: number) => void;
  teamNames: { nous: string; eux: string };
  roundToEdit: Round | null;
}

const contracts = [82, 90, 100, 110, 120, 130, 140, 150, 160, 250, 500]; // 250 for Capot, 500 for Générale

export const AddRoundModal: React.FC<AddRoundModalProps> = ({ onClose, onSave, teamNames, roundToEdit }) => {
  const [bidder, setBidder] = useState<Team>(Team.Nous);
  const [contract, setContract] = useState<number>(82);
  const [suit, setSuit] = useState<Suit>(Suit.Heart);
  const [scoreMade, setScoreMade] = useState<number | ''>('');
  const [opponentScore, setOpponentScore] = useState<number | ''>('');
  const [error, setError] = useState<string>('');
  const [checkedOff, setCheckedOff] = useState<boolean>(false);
  const [overridden, setOverridden] = useState<boolean>(false);

  const isSpecialContract = contract === 250 || contract === 500;

  useEffect(() => {
    if (roundToEdit) {
      setBidder(roundToEdit.bidder);
      setContract(roundToEdit.contract);
      setSuit(roundToEdit.suit);
      setScoreMade(roundToEdit.scoreMade);
      setCheckedOff(roundToEdit.checkedOff ?? false);
      setOverridden(roundToEdit.overridden ?? false);
      if (roundToEdit.contract !== 250 && roundToEdit.contract !== 500) {
        // Pre-fill opponent score from saved round data if it exists.
        // This removes the automatic calculation (162 - scoreMade).
        setOpponentScore(roundToEdit.opponentScore ?? '');
      } else {
        // Clear opponent score for Capot contracts.
        setOpponentScore('');
      }
    } else {
      // Reset form for new round
      setBidder(Team.Nous);
      setContract(82);
      setSuit(Suit.Heart);
      setScoreMade('');
      setOpponentScore('');
      setCheckedOff(false);
      setOverridden(false);
    }
  }, [roundToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numScoreMade = Number(scoreMade);
    const numOpponentScore = Number(opponentScore);

    if (isSpecialContract) {
        if (scoreMade === '') {
            setError(`Pour un ${contract === 250 ? 'capot' : 'générale'}, veuillez indiquer s'il est réussi ou chuté.`);
            return;
        }
        if (![0, contract].includes(numScoreMade)) {
          setError(`Pour un ${contract === 250 ? 'capot' : 'générale'}, le score doit être 0 (chuté) ou ${contract} (réussi).`);
          return;
        }
    }
    // Input validation for regular contracts has been removed as per user request.
    
    setError('');
    onSave({ bidder, contract, scoreMade: numScoreMade, opponentScore: numOpponentScore, suit, checkedOff, overridden }, roundToEdit?.id);
  };

  const TeamButton: React.FC<{ team: Team, teamName: string, selectedTeam: Team, setTeam: (team: Team) => void }> = ({ team, teamName, selectedTeam, setTeam }) => (
      <button
          type="button"
          onClick={() => setTeam(team)}
          className={`w-full py-3 text-lg font-bold rounded-md transition-colors duration-200 truncate px-2 ${
              selectedTeam === team
                  ? (team === Team.Nous ? 'bg-cyan-600 text-white' : 'bg-amber-600 text-white')
                  : 'bg-slate-700 hover:bg-slate-600'
          }`}
      >
          {teamName}
      </button>
  );

  const bidderName = bidder === Team.Nous ? teamNames.nous : teamNames.eux;
  const opponentName = bidder === Team.Nous ? teamNames.eux : teamNames.nous;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in-fast">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors">
            <XMarkIcon />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-300">
            {roundToEdit ? 'Modifier le Tour' : 'Nouveau Tour'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Qui a pris ?</label>
              <div className="grid grid-cols-2 gap-4">
                <TeamButton team={Team.Nous} teamName={teamNames.nous} selectedTeam={bidder} setTeam={setBidder} />
                <TeamButton team={Team.Eux} teamName={teamNames.eux} selectedTeam={bidder} setTeam={setBidder} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Couleur d'atout</label>
              <div className="grid grid-cols-6 gap-2 text-xl">
                {(Object.values(Suit) as Suit[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSuit(s)}
                    className={`py-2 rounded-md transition-all duration-200 border-2 ${
                      suit === s ? 'border-indigo-500 scale-110 bg-slate-600' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                    } ${s === Suit.Heart || s === Suit.Diamond ? 'text-red-400' : 'text-slate-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
                <label htmlFor="contract" className="block text-sm font-medium text-slate-400 mb-2">Contrat</label>
                <select
                    id="contract"
                    value={contract}
                    onChange={(e) => setContract(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {contracts.map(c => (
                        <option key={c} value={c}>{c === 500 ? 'Générale (500)' : c === 250 ? 'Capot (250)' : c}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex justify-around items-center">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2">
                    <input
                        type="checkbox"
                        checked={checkedOff}
                        onChange={(e) => {
                            setCheckedOff(e.target.checked);
                            if (e.target.checked) setOverridden(false);
                        }}
                        className="w-5 h-5 bg-slate-900 border-slate-600 rounded text-indigo-500 focus:ring-indigo-500"
                    />
                    Coinché
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2">
                    <input
                        type="checkbox"
                        checked={overridden}
                        onChange={(e) => {
                            setOverridden(e.target.checked);
                            if (e.target.checked) setCheckedOff(false);
                        }}
                        className="w-5 h-5 bg-slate-900 border-slate-600 rounded text-indigo-500 focus:ring-indigo-500"
                    />
                    Surcoinché
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Points réalisés</label>
                 {isSpecialContract ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setScoreMade(contract)} className={`py-3 text-lg font-bold rounded-md transition-colors duration-200 ${scoreMade === contract ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Réussi</button>
                        <button type="button" onClick={() => setScoreMade(0)} className={`py-3 text-lg font-bold rounded-md transition-colors duration-200 ${scoreMade === 0 ? 'bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Chuté</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="scoreMade" className="block text-sm font-medium text-slate-400 mb-2 truncate" title={bidderName}>
                              {bidderName} (preneur)
                           </label>
                           <input
                              id="scoreMade"
                              type="number"
                              step="1"
                              value={scoreMade}
                              onChange={(e) => setScoreMade(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                              className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                           />
                        </div>
                        <div>
                            <label htmlFor="opponentScore" className="block text-sm font-medium text-slate-400 mb-2 truncate" title={opponentName}>
                               {opponentName}
                            </label>
                            <input
                                id="opponentScore"
                                type="number"
                                step="1"
                                value={opponentScore}
                                onChange={(e) => setOpponentScore(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {roundToEdit ? 'Valider la modification' : 'Valider le tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};