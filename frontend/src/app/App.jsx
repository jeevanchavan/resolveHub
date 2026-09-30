import { RouterProvider } from 'react-router-dom';
import { routes } from './app.routes.jsx';
import { AuthProvider } from '../features/auth/state/authContext.jsx';

export const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={routes} />
    </AuthProvider>
  );
};

export default App;
