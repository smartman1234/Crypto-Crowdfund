import {
  History,
  MemoryHistory,
  createBrowserHistory,
  createMemoryHistory,
} from 'history';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

interface IOnNavigateProps {
  pathname: string;
}

interface IMountOptions {
  defaultHistory?: History | MemoryHistory;
  firebaseConfig: {
    apiKey: string;
    projectId: string;
    appId: string;
  };
  initialPath?: string;
  routes: {
    CAMPAIGNS: string;
    CAMPAIGN: string;
    ACCOUNT: string;
    FAQ: string;
  };
  testAuthenticateCredentials?: {
    email: string;
    password: string;
  };
  onNavigate?: (props: IOnNavigateProps) => void;
}

const mount = (
  mountPoint: HTMLElement,
  {
    defaultHistory,
    firebaseConfig,
    initialPath,
    routes,
    testAuthenticateCredentials,
    onNavigate,
  }: IMountOptions,
) => {
  const history =
    defaultHistory ||
    createMemoryHistory({
      initialEntries: initialPath ? [initialPath] : [],
    });
  if (onNavigate) {
    history.listen(onNavigate);
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

  if (testAuthenticateCredentials) {
    signInWithEmailAndPassword(
      auth,
      testAuthenticateCredentials!.email,
      testAuthenticateCredentials!.password,
    );
  }

  ReactDOM.render(<App history={history} routes={routes} />, mountPoint);

  return {
    onParentNavigate: ({ pathname: nextPathname }) => {
      const { pathname } = history.location;
      if (nextPathname !== pathname) {
        history.push(nextPathname);
      }
    },
  };
};

const blockchainMountPoint = document.getElementById('_blockchain-dev-root')!;
const isStandAlone =
  process.env.NODE_ENV === 'development' && blockchainMountPoint;

if (isStandAlone) {
  mount(blockchainMountPoint, {
    defaultHistory: createBrowserHistory(),
    firebaseConfig: {
      apiKey: process.env.API_KEY as string,
      projectId: process.env.PROJECT_ID as string,
      appId: process.env.APP_ID as string,
    },
    routes: {
      CAMPAIGNS: '/campaigns',
      CAMPAIGN: '/campaign',
      ACCOUNT: '/account',
      FAQ: '/faq',
    },
    testAuthenticateCredentials: {
      email: process.env.TEST_AUTHENTICATE_EMAIL as string,
      password: process.env.TEST_AUTHENTICATE_PASSWORD as string,
    },
  });
}

export { mount };
