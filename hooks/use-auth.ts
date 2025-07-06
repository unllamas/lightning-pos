'use client';

import { useState, useEffect, useCallback } from 'react';
import { LightningAddress } from '@getalby/lightning-tools';
import { webln } from '@getalby/sdk';

export type AuthMethod = 'lnaddress' | 'nwc';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  lightningAddress: string | null;
  nwcString: string | null;
}

const STORAGE_KEY = 'lnpos-auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    authMethod: null,
    lightningAddress: null,
    nwcString: null,
  });

  // Load saved authentication on initialization
  useEffect(() => {
    const loadSavedAuth = () => {
      try {
        const savedAuth = localStorage.getItem(STORAGE_KEY);
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            authMethod: parsedAuth.authMethod,
            lightningAddress: parsedAuth.lightningAddress || null,
            nwcString: parsedAuth.nwcString || null,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadSavedAuth();
  }, []);

  // Validate Lightning Address using Alby Lightning Tools
  const validateLightningAddress = useCallback(async (address: string): Promise<boolean> => {
    try {
      const ln = new LightningAddress(address);

      // Fetch LNURL-pay data to validate the address
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
          error: 'Error validating NWC string.',
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
      setAuthState((prev) => ({ ...prev, isLoading: false }));
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
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Validate Lightning Address using Alby tools
        const isValid = await validateLightningAddress(lightningAddress);

        if (!isValid) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return {
            success: false,
            error: 'Invalid Lightning Address. Please check that the address exists and supports payments.',
          };
        }

        // Save to localStorage
        const authData = {
          authMethod: 'lnaddress' as AuthMethod,
          lightningAddress,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        // Update state
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          authMethod: 'lnaddress',
          lightningAddress,
          nwcString: null,
        });

        return { success: true };
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: 'Error connecting to Lightning Address. Please try again.',
        };
      }
    },
    [validateLightningAddress],
  );

  // Login with NWC string
  const loginWithNWC = useCallback(
    async (nwcString: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Validate NWC string format
        const isValid = validateNWCString(nwcString);

        if (!isValid) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return {
            success: false,
            error: 'Invalid NWC string. Please check the format and try again.',
          };
        }

        // Save to localStorage
        const authData = {
          authMethod: 'nwc' as AuthMethod,
          nwcString,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        // Update state
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          authMethod: 'nwc',
          lightningAddress: null,
          nwcString,
        });

        return { success: true };
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: 'Error connecting with NWC. Please try again.',
        };
      }
    },
    [validateNWCString],
  );

  // Generic login function that detects the type
  const login = useCallback(
    async (credential: string): Promise<{ success: boolean; error?: string }> => {
      // Detect if it's a Lightning Address or NWC string
      if (credential.startsWith('nostr+walletconnect://')) {
        return loginWithNWC(credential);
      } else if (credential.includes('@')) {
        return loginWithLightningAddress(credential);
      } else {
        return {
          success: false,
          error: 'Invalid credential format. Please enter a Lightning Address or NWC string.',
        };
      }
    },
    [loginWithLightningAddress, loginWithNWC],
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      authMethod: null,
      lightningAddress: null,
      nwcString: null,
    });
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

  return {
    ...authState,
    login,
    logout,
    checkSession,
    validateLightningAddress,
    validateNWCString,
  };
}
