import { request, type RequestHelperError } from './helpers';
import { AsyncOperationStatus, type User, USER_ID_COOKIE_NAME } from '@shared';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { addBreadcrumb, setUser } from '@sentry/sveltekit';
import { localStorageStore } from './localStorage';

export enum AuthOperation {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP_ANON = 'SIGN_UP_ANON',
  SIGN_UP = 'SIGN_UP',
  SIGN_OUT = 'SIGN_OUT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET = 'PASSWORD_RESET',
  FETCH_ME = 'FETCH_ME',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
}

interface State {
  user: null | User;
  status: AsyncOperationStatus;
  error: null | RequestHelperError;
  operation: null | AuthOperation;
}

const initialValue: State = {
  user: null,
  status: AsyncOperationStatus.IDLE,
  error: null,
  operation: null,
};

const LOCAL_STORAGE_KEY = 'auth';

const store = localStorageStore<State>(LOCAL_STORAGE_KEY, initialValue);

function mutate(state: Partial<State>) {
  const prevState = get(store);
  const nextState = { ...prevState, ...state };
  store.set(nextState);

  if (typeof state.user !== 'undefined') {
    // if user changed
    const wasUserAuthenticated = prevState.user !== null;
    const isUserAuthenticated = state.user !== null;
    if (wasUserAuthenticated !== isUserAuthenticated) {
      setUser(
        state.user
          ? {
              id: state.user.id,
              email: state.user.email || undefined,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              username:
                state.user.firstName && state.user.lastName
                  ? `${state.user.firstName} ${state.user.lastName}`
                  : undefined,
            }
          : null,
      );
      onAuthStateChangeSubscribers.forEach(subscriber => subscriber(nextState.user));
    }
  }
}

const onAuthStateChangeSubscribers: Array<(user: null | User) => void> = [];

export const auth = {
  subscribe: store.subscribe,
  signIn: async (email: string, password: string): Promise<void> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.SIGN_IN,
    });
    const payload = { email, password };
    const [error, user] = await request<User>('/api/users/sign-in', 'POST', payload);
    addBreadcrumb({
      category: 'auth',
      message: `Sign in with email and password was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: user?.id },
    });
    mutate({
      status: user ? AsyncOperationStatus.SUCCESS : AsyncOperationStatus.ERROR,
      user,
      error,
    });
  },
  signUpAnon: async (): Promise<void> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: undefined,
      operation: AuthOperation.SIGN_UP_ANON,
    });
    const [error, user] = await request<User>('/api/users/anon', 'POST');
    addBreadcrumb({
      category: 'auth',
      message: `Sign up anonymous was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: user?.id },
    });
    mutate({
      status: user ? AsyncOperationStatus.SUCCESS : AsyncOperationStatus.ERROR,
      user,
      error,
    });
  },
  signUp: async (email: string, password: string): Promise<void> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: undefined,
      operation: AuthOperation.SIGN_UP,
    });
    const [error, user] = await request<User>('/api/users', 'POST', { email, password });
    addBreadcrumb({
      category: 'auth',
      message: `Sign up with email and password was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: user?.id },
    });
    mutate({
      status: user ? AsyncOperationStatus.SUCCESS : AsyncOperationStatus.ERROR,
      user,
      error,
    });
  },
  signOut: async () => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: undefined,
      operation: AuthOperation.SIGN_OUT,
    });
    const [error] = await request<void>('/api/users/sign-out', 'POST');
    addBreadcrumb({
      category: 'auth',
      message: `Sign out was ${error ? 'unsuccessful' : 'successful'}`,
    });
    mutate({
      status: error ? AsyncOperationStatus.ERROR : AsyncOperationStatus.IDLE,
      error,
      user: null,
    });
  },
  passwordResetRequest: async (email: string): Promise<void> => {
    if (!email) {
      mutate({
        status: AsyncOperationStatus.ERROR,
        error: {
          body: { message: 'Enter email, so we send you a reset password link.' },
          status: 400,
        },
        operation: AuthOperation.PASSWORD_RESET_REQUEST,
      });
      return;
    }
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.PASSWORD_RESET_REQUEST,
    });
    const [error] = await request<void>('/api/users/password-reset-request', 'POST', { email });
    addBreadcrumb({
      category: 'auth',
      message: `Request password reset was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error },
    });
    mutate({
      status: error ? AsyncOperationStatus.ERROR : AsyncOperationStatus.SUCCESS,
      error,
    });
    if (!error) {
      // toastStore.trigger({
      //   message: `Check email "${email}" for a reset password link.`,
      //   background: 'bg-roley-green',
      //   autohide: false,
      // });
    }
  },
  passwordReset: async (token: string, password: string): Promise<void> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.PASSWORD_RESET,
    });
    const [error, user] = await request<User>('/api/users/password-reset', 'POST', {
      token,
      password,
    });
    addBreadcrumb({
      category: 'auth',
      message: `Reset password was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: user?.id },
    });
    mutate({
      status: user ? AsyncOperationStatus.SUCCESS : AsyncOperationStatus.ERROR,
      error,
      user,
    });
    if (!error) {
      // toastStore.trigger({
      //   message: `Your new password has been set.`,
      //   background: 'bg-roley-green',
      //   timeout: 15000,
      // });
    }
  },
  fetchMe: async (): Promise<void> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.FETCH_ME,
    });
    const [error, user] = await request<User>('/api/users/me');
    addBreadcrumb({
      category: 'auth',
      message: `Fetch me was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: user?.id },
    });
    if (error) {
      if (error.status === 401) {
        mutate({ status: AsyncOperationStatus.IDLE, error: null, user: null });
      } else {
        mutate({ status: AsyncOperationStatus.ERROR, error });
      }
    } else {
      mutate({ user, status: AsyncOperationStatus.SUCCESS });
    }
  },
  oauth: (provider: AuthOperation.GOOGLE | AuthOperation.FACEBOOK): void => {
    addBreadcrumb({
      category: 'auth',
      message: `Sign in with ${provider}`,
    });
    mutate({ status: AsyncOperationStatus.IN_PROGRESS, error: null, operation: provider });
  },
  update: async (user: Partial<User>): Promise<[null | User, null | RequestHelperError]> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.UPDATE,
    });
    const [error, updatedUser] = await request<User>('/api/users/me', 'PATCH', user);
    addBreadcrumb({
      category: 'auth',
      message: `Update account was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error, userId: updatedUser?.id },
    });
    if (error) {
      mutate({ status: AsyncOperationStatus.ERROR, error });
      return [null, error];
    } else {
      mutate({ status: AsyncOperationStatus.SUCCESS, user: updatedUser });
      return [updatedUser, null];
    }
  },
  delete: async (): Promise<boolean> => {
    mutate({
      status: AsyncOperationStatus.IN_PROGRESS,
      error: null,
      operation: AuthOperation.DELETE,
    });
    const [error] = await request<void>('/api/users/me', 'DELETE');
    addBreadcrumb({
      category: 'auth',
      message: `Delete account was ${error ? 'unsuccessful' : 'successful'}`,
      data: { error },
    });
    if (error) {
      mutate({ status: AsyncOperationStatus.ERROR, error });
      return false;
    } else {
      mutate(initialValue);
      return true;
    }
  },
  onAuthStateChange: (cb: (user: null | User) => void): (() => void) => {
    onAuthStateChangeSubscribers.push(cb);
    return () => {
      const index = onAuthStateChangeSubscribers.indexOf(cb);
      if (index !== -1) {
        onAuthStateChangeSubscribers.splice(index, 1);
      }
    };
  },
  signInWithGoogleURL: '/api/users/google',
  signInWithFacebookURL: '/api/users/facebook',
};

function init() {
  mutate({ status: AsyncOperationStatus.IDLE, error: undefined }); // force initial value

  if (!browser) {
    return;
  }

  // if cookie with user.id exists - fetch user
  if (document.cookie.includes(USER_ID_COOKIE_NAME)) {
    void auth.fetchMe();
  }
}

init();
