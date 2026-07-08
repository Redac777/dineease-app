// API publique du module auth. Les autres modules n'importent QUE ce fichier.
export type { Role, Credentials, AuthUser, AuthGateway } from './types';
export type { AuthService } from './auth.service';
export { createAuth, GENERIC_SIGNIN_ERROR } from './auth.service';
export { credentialsSchema, parseCredentials } from './validation';
export type { CredentialsInput } from './validation';
