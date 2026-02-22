import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import MessagesPage from './pages/MessagesPage';
import MessageThreadPage from './pages/MessageThreadPage';
import UploadPage from './pages/UploadPage';
import StoryViewerPage from './pages/StoryViewerPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {isAuthenticated ? (
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        <Outlet />
      )}
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

function LoginRouteComponent() {
  const { identity } = useInternetIdentity();
  if (identity) {
    window.location.hash = '/feed';
    return null;
  }
  return <LoginPage />;
}

const rootRoute = createRootRoute({
  component: RootComponent
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginRouteComponent
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: FeedPage
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: ProfilePage
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: ExplorePage
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage
});

const messageThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$userId',
  component: MessageThreadPage
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage
});

const storyViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories/$userId',
  component: StoryViewerPage
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  feedRoute,
  profileRoute,
  exploreRoute,
  messagesRoute,
  messageThreadRoute,
  uploadRoute,
  storyViewerRoute
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
