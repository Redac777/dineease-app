// Service d'auth : logique métier pure, indépendante du fournisseur (gateway injectée).
import type { AuthGateway, AuthUser, Credentials } from './types';
import { parseCredentials } from './validation';

/** Message unique à la connexion : ne révèle jamais si l'email existe (anti-énumération). */
export const GENERIC_SIGNIN_ERROR = 'Email ou mot de passe incorrect.';

export interface AuthService {
  signUp(input: Credentials): Promise<AuthUser>;
  signIn(input: Credentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

/** Compose le service à partir d'une gateway (Supabase en prod, faux en test). */
export function createAuth(gateway: AuthGateway): AuthService {
  return {
    async signUp(input) {
      const creds = parseCredentials(input);
      return gateway.signUp(creds);
    },
    async signIn(input) {
      const creds = parseCredentials(input);
      try {
        return await gateway.signIn(creds);
      } catch {
        throw new Error(GENERIC_SIGNIN_ERROR);
      }
    },
    async signOut() {
      await gateway.signOut();
    },
    async getCurrentUser() {
      return gateway.getCurrentUser();
    },
  };
}
