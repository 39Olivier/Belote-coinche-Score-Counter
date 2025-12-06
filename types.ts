export enum Team {
  Nous = 'Nous',
  Eux = 'Eux',
}

export enum Suit {
  Spade = '♠️',
  Heart = '♥️',
  Diamond = '♦️',
  Club = '♣️',
  NoTrump = 'SA', // Sans Atout
  AllTrump = 'TA', // Tout Atout
}

export interface Round {
  id: number;
  nous: number;
  eux: number;
  details: string;
  bidder: Team;
  contract: number;
  suit: Suit;
  scoreMade: number;
  opponentScore: number;
  checkedOff?: boolean;
  overridden?: boolean;
  animationClass?: string;
}

export interface NewRoundData {
  bidder: Team;
  contract: number;
  scoreMade: number;
  opponentScore: number;
  suit: Suit;
  checkedOff?: boolean;
  overridden?: boolean;
}