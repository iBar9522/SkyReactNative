import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa' 
  },
  loadingText: { fontSize: 48, marginBottom: 16 },
  loadingSubText: { fontSize: 16, color: '#6c757d' },
  authContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa', 
    padding: 20 
  },
  authContent: { alignItems: 'center', maxWidth: 300 },
  lockIcon: { fontSize: 64, marginBottom: 24 },
  authTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#212529', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  authSubtitle: { 
    fontSize: 16, 
    color: '#6c757d', 
    textAlign: 'center', 
    marginBottom: 32, 
    lineHeight: 22 
  },
  buttonContainer: { width: '100%', gap: 12 },
  primaryButton: { 
    backgroundColor: '#007bff', 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { 
    backgroundColor: 'transparent', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    alignItems: 'center' 
  },
  secondaryButtonText: { color: '#007bff', fontSize: 14, fontWeight: '500' },
  debugButton: { 
    backgroundColor: 'transparent', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    alignItems: 'center', 
    marginTop: 20 
  },
  debugText: { color: '#6c757d', fontSize: 12 },
});