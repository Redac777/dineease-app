// Validation des identifiants aux frontières (règle constitution : Zod partout).
import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;

/** Parse + normalise (email en minuscules, trim). Lève une ZodError si invalide. */
export function parseCredentials(input: unknown): CredentialsInput {
  return credentialsSchema.parse(input);
}
