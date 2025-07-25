'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { LightningAddress } from '@getalby/lightning-tools';
import { webln } from '@getalby/sdk';

export type AuthMethod = 'lnaddress' | 'nwc';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  lightningAddress: string | null;
  nwcString: string | null;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { authMethod: AuthMethod; lightningAddress?: string; nwcString?: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { authMethod: AuthMethod; lightningAddress?: string; nwcString?: string } };

interface AuthContextType extends AuthState {
  login: (credential: string) => Promise<{ success: boolean; error?: string }>;
  loginWithLightningAddress: (lightningAddress: string) => Promise<{ success: boolean; error?: string }>;
  loginWithNWC: (nwcString: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => { isValid: boolean; authMethod?: AuthMethod; lightningAddress?: string; nwcString?: string };
  validateLightningAddress: (address: string) => Promise<boolean>;
  validateNWCString: (nwcString: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  waitForInitialization: () => void;
}

const STORAGE_KEY = 'lnpos-auth';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  authMethod: null,
  lightningAddress: null,
  nwcString: null,
  error: null,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        authMethod: action.payload.authMethod,
        lightningAddress: action.payload.lightningAddress || null,
        nwcString: action.payload.nwcString || null,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        authMethod: action.payload.authMethod,
        lightningAddress: action.payload.lightningAddress || null,
        nwcString: action.payload.nwcString || null,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load saved authentication on initialization
  useEffect(() => {
    const loadSavedAuth = () => {
      try {
        const savedAuth = localStorage.getItem(STORAGE_KEY);
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);

          if (parsedAuth.authMethod === 'nwc') {
            logout();
            return;
          }

          // Validate the saved data structure
          if (parsedAuth.authMethod && (parsedAuth.lightningAddress || parsedAuth.nwcString)) {
            dispatch({
              type: 'RESTORE_SESSION',
              payload: {
                authMethod: parsedAuth.authMethod,
                lightningAddress: parsedAuth.lightningAddress,
                nwcString: parsedAuth.nwcString,
              },
            });
          } else {
            // Invalid saved data, clear it
            localStorage.removeItem(STORAGE_KEY);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'SET_ERROR', payload: 'Error loading saved authentication' });
      }
    };

    loadSavedAuth();
  }, []);

  // Validate Lightning Address using Alby Lightning Tools
  const validateLightningAddress = useCallback(async (address: string): Promise<boolean> => {
    try {
      const ln = new LightningAddress(address);
      await ln.fetch();
      return true;
    } catch (error) {
      console.error('Error validating Lightning Address:', error);
      return false;
    }
  }, []);

  // Validate NWC string format using Alby SDK
  const validateNWCString = useCallback(async (nwcString: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Basic format validation
      if (!nwcString.startsWith('nostr+walletconnect://')) {
        return {
          success: false,
          error: 'Invalid NWC string format. Must start with "nostr+walletconnect://"',
        };
      }

      const nwc = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: nwcString });
      await nwc.enable();

      // Test basic functionality to ensure connection works
      const info = await nwc.getInfo();
      console.log('NWC connection successful:', info);

      return {
        success: true,
        error: undefined,
      };
    } catch (error) {
      console.error('Error validating NWC string:', error);
      return {
        success: false,
        error: 'Failed to connect to NWC wallet. Please check your connection string and wallet status.',
      };
    }
  }, []);

  // Login with Lightning Address
  const loginWithLightningAddress = useCallback(
    async (lightningAddress: string): Promise<{ success: boolean; error?: string }> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Validate Lightning Address using Alby tools
        const isValid = await validateLightningAddress(lightningAddress);

        if (!isValid) {
          const error = 'Invalid Lightning Address.';
          dispatch({ type: 'SET_ERROR', payload: error });
          return { success: false, error };
        }

        // Save to localStorage
        const authData = {
          authMethod: 'lnaddress' as AuthMethod,
          lightningAddress,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            authMethod: 'lnaddress',
            lightningAddress,
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage = 'Error connecting to Lightning Address. Please try again.';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [validateLightningAddress],
  );

  // Login with NWC string
  const loginWithNWC = useCallback(
    async (nwcString: string): Promise<{ success: boolean; error?: string }> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Validate NWC string format
        const validation = await validateNWCString(nwcString);

        if (!validation.success) {
          dispatch({ type: 'SET_ERROR', payload: validation.error || 'Invalid NWC string' });
          return { success: false, error: validation.error };
        }

        // Save to localStorage
        const authData = {
          authMethod: 'nwc' as AuthMethod,
          nwcString,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            authMethod: 'nwc',
            nwcString,
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage = 'Error connecting with NWC. Please try again.';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [validateNWCString],
  );

  // Generic login function that detects the type
  const login = useCallback(
    async (credential: string): Promise<{ success: boolean; error?: string }> => {
      // Detect if it's a Lightning Address or NWC string
      // if (credential.startsWith('nostr+walletconnect://')) {
      //   return loginWithNWC(credential);
      // }
      if (credential.includes('@')) {
        return loginWithLightningAddress(credential);
      } else {
        const error = 'Invalid credential format.';
        dispatch({ type: 'SET_ERROR', payload: error });
        return { success: false, error };
      }
    },
    [loginWithLightningAddress, loginWithNWC],
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Check if there's an active session
  const checkSession = useCallback(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        return {
          isValid: true,
          authMethod: parsedAuth.authMethod,
          lightningAddress: parsedAuth.lightningAddress,
          nwcString: parsedAuth.nwcString,
        };
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const waitForInitialization = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (state.isInitialized) {
        resolve();
        return;
      }

      // Poll until initialized
      const checkInitialization = () => {
        if (state.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInitialization, 50);
        }
      };

      checkInitialization();
    });
  }, [state.isInitialized]);

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    loginWithLightningAddress,
    loginWithNWC,
    logout,
    checkSession,
    validateLightningAddress,
    validateNWCString,
    clearError,
    waitForInitialization,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
