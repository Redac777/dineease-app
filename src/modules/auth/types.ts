// Types du module auth. Rôles du staff + client anonyme (voir spec).

export type Role = 'gerant' | 'chef' | 'serveur';

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  /** Restaurant auquel le compte staff est rattaché (null tant que non affecté). */
  restaurantId: string | null;
}

/**
 * Frontière remplaçable vers le fournisseur d'auth (Supabase Auth en prod, faux en test).
 * Le service métier ne dépend que de cette interface (injection), jamais de Supabase directement.
 */
export interface AuthGateway {
  signUp(input: Credentials): Promise<AuthUser>;
  signIn(input: Credentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}
