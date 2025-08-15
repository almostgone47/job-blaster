import React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {UserPreferencesProvider} from '../contexts/UserPreferences';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) => {
  const {queryClient = createTestQueryClient(), ...renderOptions} = options;

  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );

  return render(ui, {wrapper: Wrapper, ...renderOptions});
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export {customRender as render};
