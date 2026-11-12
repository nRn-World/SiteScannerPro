import type { Language } from './translations';

export interface AccountCopy {
  title: string;
  subtitle: string;
  signIn: string;
  register: string;
  email: string;
  password: string;
  passwordHint: string;
  submitSignIn: string;
  submitRegister: string;
  loading: string;
  noAccount: string;
  haveAccount: string;
  logout: string;
  signedInAs: string;
  close: string;
  account: string;
  monitors: string;
  errorInvalid: string;
  errorEmailTaken: string;
  errorWeakPassword: string;
  errorEmail: string;
  errorStorage: string;
  errorGeneric: string;
}

const english: AccountCopy = {
  title: 'Your account',
  subtitle: 'Sign in to keep an eye on your sites. Scanning still works without an account.',
  signIn: 'Sign in',
  register: 'Create account',
  email: 'Email',
  password: 'Password',
  passwordHint: 'At least 8 characters.',
  submitSignIn: 'Sign in',
  submitRegister: 'Create account',
  loading: 'Working…',
  noAccount: 'No account yet?',
  haveAccount: 'Already have an account?',
  logout: 'Sign out',
  signedInAs: 'Signed in as',
  close: 'Close',
  account: 'Account',
  monitors: 'Monitoring',
  errorInvalid: 'The email or password is incorrect.',
  errorEmailTaken: 'An account with that email already exists.',
  errorWeakPassword: 'The password must be at least 8 characters.',
  errorEmail: 'Enter a valid email address.',
  errorStorage: 'The account could not be saved. Try again.',
  errorGeneric: 'Something went wrong. Try again.'
};

const swedish: AccountCopy = {
  title: 'Ditt konto',
  subtitle: 'Logga in för att hålla koll på dina sajter. Skanning fungerar fortfarande utan konto.',
  signIn: 'Logga in',
  register: 'Skapa konto',
  email: 'E-post',
  password: 'Lösenord',
  passwordHint: 'Minst 8 tecken.',
  submitSignIn: 'Logga in',
  submitRegister: 'Skapa konto',
  loading: 'Arbetar…',
  noAccount: 'Har du inget konto?',
  haveAccount: 'Har du redan ett konto?',
  logout: 'Logga ut',
  signedInAs: 'Inloggad som',
  close: 'Stäng',
  account: 'Konto',
  monitors: 'Övervakning',
  errorInvalid: 'E-postadressen eller lösenordet är fel.',
  errorEmailTaken: 'Det finns redan ett konto med den e-postadressen.',
  errorWeakPassword: 'Lösenordet måste vara minst 8 tecken.',
  errorEmail: 'Ange en giltig e-postadress.',
  errorStorage: 'Kontot kunde inte sparas. Försök igen.',
  errorGeneric: 'Något gick fel. Försök igen.'
};

export function getAccountCopy(language: Language): AccountCopy {
  return language === 'sv' ? swedish : english;
}
