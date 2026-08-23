import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateRfp from './pages/CreateRfp';
import { createRfp } from './api';

jest.mock('./api', () => ({
  createRfp: jest.fn(),
}));

test('navigates to the new RFP detail page using the Mongo _id', async () => {
  createRfp.mockResolvedValue({ _id: '64cfe3d9a9d5d59f2f19a0aa', title: 'Laptop RFP' });

  render(
    <MemoryRouter>
      <CreateRfp />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/describe what you need/i), {
    target: { value: 'Need 10 laptops with 16GB RAM' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create rfp/i }));

  await waitFor(() => {
    expect(createRfp).toHaveBeenCalledWith('Need 10 laptops with 16GB RAM');
  });

  await waitFor(() => {
    expect(screen.getByText(/structured rfp/i)).toBeInTheDocument();
  });
});
