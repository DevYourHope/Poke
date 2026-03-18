export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  shinySprite: string;
  types?: string[];
}

export interface Game {
  id: string;
  name: string;
  baseOdds: number;
  pokedex?: string;
  maxNationalId?: number;
  isCustom?: boolean;
  team?: TeamMember[];
}

export interface HuntingSession {
  pokemonId: number;
  pokemonName: string;
  gameId: string;
  encounters: number;
  odds: number;
  startTime: number;
  notes?: string;
}

export interface CaughtPokemon {
  caught: boolean;
  shiny: boolean;
}

export interface PersonalPokedex {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  caughtData: Record<number, CaughtPokemon>;
}

export interface ShinyRecord {
  id: string;
  pokemon: Pokemon;
  game: Game;
  encounters: number;
  date: number;
  notes?: string;
}

export interface TeamMember {
  id: string;
  pokemon: Pokemon;
  isShiny: boolean;
}

export interface Team {
  id: string;
  name: string;
  gameId: string;
  members: TeamMember[];
  createdAt: number;
}
