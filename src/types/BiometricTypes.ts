interface BiometricSetupOptions {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
}
interface BiometricLoginOptions {
  challenge: string;
  rpId: string;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: string[];
  }>;
}


interface UseBiometricAuthProps {
  userId?: string | null;
  biometricOptionsRegistration?: BiometricSetupOptions | undefined; 
  onSetupComplete?: () => void;
  biometricOptionsLogin?: BiometricLoginOptions | undefined;
  onLoginComplete?: (success: boolean) => void;

}