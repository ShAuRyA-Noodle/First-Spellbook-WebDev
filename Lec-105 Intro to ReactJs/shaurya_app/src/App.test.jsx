import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders the app and increments the counter', () => {
  render(<App />);
  expect(screen.getByText('Shaurya_Newbie')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Touch Me' }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
