// Or wherever your main layout component is located
import { useToast } from '../hooks/useToast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { ToastContainer } = useToast();
  
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}