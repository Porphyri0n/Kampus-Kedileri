import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminPanel } from './AdminPanel';
import { UserRole, User } from '../types';
import { ApiService } from '../services/api';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    getCats: vi.fn().mockResolvedValue([]),
    updateCat: vi.fn(),
    deleteCat: vi.fn(),
    addNews: vi.fn(),
  },
}));

describe('AdminPanel', () => {
  it("displays 'Yetkisiz Erişim' when a user with role: 'STUDENT' tries to access", () => {
    const studentUser: User = {
      id: '123',
      email: 'student@example.com',
      name: 'John Doe',
      role: UserRole.STUDENT,
    };

    render(<AdminPanel user={studentUser} />);

    expect(screen.getByText('Yetkisiz Erişim')).toBeInTheDocument();
  });

  it("renders the 'Yönetim Paneli' title correctly when a user with role: 'ADMIN' accesses it", async () => {
    const adminUser: User = {
      id: '456',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    };

    render(<AdminPanel user={adminUser} />);

    // Wait for any potential async operations (though the title is rendered immediately)
    // Using waitFor to ensure we're safe if the component does some data fetching before showing the title (though in this code it shows immediately)
    // However, the component does fetch data on mount.
    await waitFor(() => {
        expect(screen.getByText('Yönetim Paneli')).toBeInTheDocument();
    })
  });
});
