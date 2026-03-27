import { useState, useEffect } from 'react';
import { Pokemon } from '../types';

const CACHE_KEY = 'pokeapi_pokemon_list_shared';
const CACHE_TIME_KEY = 'pokeapi_pokemon_list_shared_time';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function usePokemonList() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
        try {
          setPokemonList(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing cached pokemon list:', e);
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('Failed to fetch pokemon list');
        
        const data = await res.json();
        const formatted: Pokemon[] = data.results.map((p: any, index: number) => {
          const id = index + 1;
          const displayName = p.name
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return {
            id,
            name: displayName,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
          };
        });
        
        setPokemonList(formatted);
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching pokemon list:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback to stale cache if available
        if (cachedData) {
          setPokemonList(JSON.parse(cachedData));
        }
      }
    };

    fetchPokemon();
  }, []);

  return { pokemonList, isLoading, error };
}
