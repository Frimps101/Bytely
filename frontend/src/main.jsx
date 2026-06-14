import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import RegisterPage from './routes/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import WritePostPage from './pages/WritePostPage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/write", element: <WritePostPage /> },
      { path: "/edit/:slug", element: <WritePostPage /> },
      { path: "/post/:slug", element: <PostDetailPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider> 
    {/* <App /> */}
    </ClerkProvider>
  </StrictMode>
)
