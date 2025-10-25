import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { NotificationsProvider } from '../context/NotificationsContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Component {...pageProps} />
      </NotificationsProvider>
    </AuthProvider>
  );
}
