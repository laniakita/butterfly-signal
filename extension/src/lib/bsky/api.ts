import { Agent, CredentialSession } from '@atproto/api';

const session = new CredentialSession(new URL('https://api.bsky.app'));
export const agent = new Agent(session);
