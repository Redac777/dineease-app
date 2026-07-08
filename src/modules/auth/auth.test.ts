// Tests unitaires du module auth (niveau (a) de la règle des 3 niveaux). Vitest.
import { describe, it, expect, vi } from 'vitest';
import { createAuth, GENERIC_SIGNIN_ERROR, parseCredentials } from './index';
import type { AuthGateway, AuthUser } from './index';

const user: AuthUser = { id: 'u1', email: 'gerant@resto.ma', role: 'gerant', restaurantId: 'r1' };

function fakeGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signUp: vi.fn(async () => user),
    signIn: vi.fn(async () => user),
    signOut: vi.fn(async () => {}),
    getCurrentUser: vi.fn(async () => user),
    ...overrides,
  };
}

describe('validation des identifiants', () => {
  it('accepte un email valide et normalise (minuscules + trim)', () => {
    const creds = parseCredentials({ email: '  Gerant@Resto.MA ', password: 'motdepasse1' });
    expect(creds.email).toBe('gerant@resto.ma');
  });

  it('rejette un email invalide', () => {
    expect(() => parseCredentials({ email: 'pasunemail', password: 'motdepasse1' })).toThrow();
  });

  it('rejette un mot de passe trop court', () => {
    expect(() => parseCredentials({ email: 'a@b.com', password: 'court' })).toThrow();
  });
});

describe('service auth', () => {
  it('signUp valide les identifiants puis délègue à la gateway', async () => {
    const gw = fakeGateway();
    const auth = createAuth(gw);
    const res = await auth.signUp({ email: 'gerant@resto.ma', password: 'motdepasse1' });
    expect(res).toEqual(user);
    expect(gw.signUp).toHaveBeenCalledOnce();
  });

  it('signIn renvoie un message générique en cas d échec (anti-énumération)', async () => {
    const gw = fakeGateway({
      signIn: vi.fn(async () => {
        throw new Error('user not found');
      }),
    });
    const auth = createAuth(gw);
    await expect(
      auth.signIn({ email: 'gerant@resto.ma', password: 'motdepasse1' }),
    ).rejects.toThrow(GENERIC_SIGNIN_ERROR);
  });

  it('signIn rejette des identifiants invalides AVANT d appeler la gateway', async () => {
    const gw = fakeGateway();
    const auth = createAuth(gw);
    await expect(auth.signIn({ email: 'x', password: 'y' })).rejects.toThrow();
    expect(gw.signIn).not.toHaveBeenCalled();
  });
});
