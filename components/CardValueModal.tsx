import React from 'react';
import { XMarkIcon } from './icons/Icons';

export const CardValueModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const cardValues = {
        headers: ['7', '8', '9', '10', 'V', 'D', 'R', 'AS'],
        rows: [
            { suit: 'HORS ATOUT', values: ['0', '0', '0', '10', '2', '3', '4', '11'] },
            { suit: 'ATOUT', values: ['0', '0', '14', '10', '20', '3', '4', '11'] },
            { suit: 'SANS ATOUT', values: ['0', '0', '0', '10', '2', '3', '4', '19'] },
            { suit: 'TOUT ATOUT', values: ['0', '0', '9', '5', '14', '1', '3', '6'] },
        ]
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in-fast" role="dialog" aria-modal="true" aria-labelledby="card-values-title">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors z-10" aria-label="Fermer">
                    <XMarkIcon />
                </button>
                <div className="p-6">
                    <h2 id="card-values-title" className="text-xl font-bold text-center mb-4 text-slate-300">Valeur des cartes - Belote Coinchée</h2>
                    <div className="overflow-x-auto rounded-lg border-2 border-slate-700">
                        <table className="min-w-full text-center text-white">
                            <thead className="bg-sky-800">
                                <tr>
                                    <th className="p-3 border-r-2 border-slate-700 font-semibold text-sm uppercase">VALEUR CARTES</th>
                                    {cardValues.headers.map(header => (
                                        <th key={header} className="p-3 border-r-2 border-slate-700 font-semibold text-lg last:border-r-0">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cardValues.rows.map((row) => (
                                    <tr key={row.suit} className="bg-sky-600 border-t-2 border-slate-700">
                                        <td className="p-3 border-r-2 border-slate-700 font-bold text-sm uppercase whitespace-nowrap">{row.suit}</td>
                                        {row.values.map((value, valueIndex) => (
                                            <td key={valueIndex} className="p-3 border-r-2 border-slate-700 font-mono text-lg last:border-r-0">{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
