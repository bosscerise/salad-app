import { useState, useEffect } from 'react';
import { Edit, Trash2, Search, X, Save, AlertCircle, CheckCircle, RefreshCw, Shield, MoreVertical, ChevronUp, ChevronDown, Users, Mail } from 'lucide-react';
import { pb } from '../../../pb';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: string;
  points: number;
  created: string;
  updated: string;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof User>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFixingEmails, setIsFixingEmails] = useState(false);
  const [fixEmailsSuccess, setFixEmailsSuccess] = useState(false);
  const [missingEmailsCount, setMissingEmailsCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        if (!pb.authStore.isValid || !pb.authStore.model || pb.authStore.model.role !== 'admin') {
          throw new Error('Admin access required');
        }

        const authToken = pb.authStore.token;

        const response = await fetch(
          `${pb.baseUrl}/api/collections/users/records?perPage=1000&sort=${sortDirection === 'desc' ? '-' : ''}${sortField}`,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();

        setUsers(data.items.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name || '(No Name)',
          phone: user.phone || '',
          avatar: user.avatar ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=100x100` : undefined,
          role: user.role || 'customer',
          points: user.points || 0,
          created: user.created,
          updated: user.updated,
        })));

        setMissingEmailsCount(data.items.filter(user => !user.email).length);

        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(`Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openUserModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (userData: Partial<User>) => {
    if (!selectedUser) return;

    const updateUser = async () => {
      try {
        setIsLoading(true);
        const { id, avatar, created, updated, ...updateData } = userData;

        await pb.collection('users').update(selectedUser.id, updateData);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? { ...user, ...updateData } : user
          )
        );

        setIsModalOpen(false);
        setError(null);
      } catch (err) {
        console.error('Error updating user:', err);
        setError('Failed to update user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    updateUser();
  };

  const handleDeleteUser = (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    const deleteUser = async () => {
      try {
        setIsLoading(true);
        await pb.collection('users').delete(userId);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setError(null);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    deleteUser();
  };

  const fixAllEmailVisibility = async () => {
    if (!confirm('This will ensure all users\' emails are visible to admin. Continue?')) return;

    setIsFixingEmails(true);
    let fixedCount = 0;
    let errorCount = 0;

    try {
      const usersToFix = users.filter(user => !user.email);

      for (const user of usersToFix) {
        try {
          await pb.collection('users').update(user.id, {
            emailVisibility: true,
          });

          fixedCount++;
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (err) {
          console.error(`Failed to update user ${user.id}:`, err);
          errorCount++;
        }
      }

      if (fixedCount > 0) {
        setFixEmailsSuccess(true);

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (errorCount > 0) {
        setError(`Failed to update any users. Errors: ${errorCount}`);
      } else {
        setError('No users needed email visibility updates');
      }
    } catch (err) {
      console.error('Error fixing email visibility:', err);
      setError(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsFixingEmails(false);
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex flex-col p-4 border-b sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-gray-800 md:hidden">User Management</h2>
          
          <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {missingEmailsCount > 0 && (
              <button
                onClick={fixAllEmailVisibility}
                disabled={isFixingEmails || fixEmailsSuccess}
                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shrink-0 
                  ${isFixingEmails || fixEmailsSuccess ? 'bg-gray-400' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {isFixingEmails ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    <span className="hidden sm:inline">Fixing...</span>
                  </>
                ) : fixEmailsSuccess ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    <span className="hidden sm:inline">Fixed!</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} className="mr-2" />
                    <span className="hidden sm:inline">Fix</span> {missingEmailsCount} <span className="hidden sm:inline">Missing Emails</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {missingEmailsCount > 0 ? (
          <div className="p-4 mb-3 text-sm border-l-4 rounded-md text-amber-700 bg-amber-50 border-amber-500">
            <div className="flex">
              <Shield className="flex-shrink-0 w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Email Visibility Notice</p>
                <p className="mt-1">
                  {missingEmailsCount} of {users.length} users have hidden email addresses. 
                  Click "Fix Missing Emails" to make all emails visible to admin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 mb-3 text-sm text-green-700 border-l-4 border-green-500 rounded-md bg-green-50">
            <div className="flex">
              <CheckCircle className="flex-shrink-0 w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">All Users Accessible</p>
                <p className="mt-1">
                  You have access to view and manage all {users.length} users in the system.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-4 text-xs font-medium tracking-wider uppercase">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </div>
              </th>
              <th className="hidden p-4 text-xs font-medium tracking-wider uppercase md:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  Email {getSortIcon('email')}
                </div>
              </th>
              <th className="hidden p-4 text-xs font-medium tracking-wider uppercase lg:table-cell">Phone</th>
              <th className="p-4 text-xs font-medium tracking-wider uppercase">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  Role {getSortIcon('role')}
                </div>
              </th>
              <th className="hidden p-4 text-xs font-medium tracking-wider uppercase sm:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('points')}
                >
                  Points {getSortIcon('points')}
                </div>
              </th>
              <th className="hidden p-4 text-xs font-medium tracking-wider uppercase md:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('created')}
                >
                  Joined {getSortIcon('created')}
                </div>
              </th>
              <th className="p-4 text-xs font-medium tracking-wider text-right uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin text-emerald-500" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  <div className="py-8">
                    <div className="flex items-center justify-center mx-auto mb-3 text-gray-400 bg-gray-100 rounded-full w-14 h-14">
                      <Users size={24} />
                    </div>
                    <p>No users found</p>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="mt-2 text-sm text-emerald-600 hover:underline">
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 overflow-hidden rounded-full bg-emerald-100">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full font-medium text-emerald-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 md:hidden">{user.email || '(No email)'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden p-4 md:table-cell">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <span className="truncate max-w-[200px]">{user.email || '(No email)'}</span>
                    </div>
                  </td>
                  <td className="hidden p-4 lg:table-cell">{user.phone || '—'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="hidden p-4 sm:table-cell">{user.points}</td>
                  <td className="hidden p-4 md:table-cell">
                    {new Date(user.created).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="justify-end hidden space-x-2 sm:flex">
                      <button
                        onClick={() => openUserModal(user)}
                        className="p-1 text-blue-600 transition-colors rounded hover:bg-blue-100"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-600 transition-colors rounded hover:bg-red-100"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="relative sm:hidden dropdown">
                      <button className="p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical size={18} />
                      </button>
                      <div className="dropdown-content absolute right-0 bg-white shadow-lg rounded-md py-1 min-w-[120px] z-10 hidden">
                        <button
                          onClick={() => openUserModal(user)}
                          className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          <Edit size={14} className="mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleEditUser}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, isOpen, onClose, onSave }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'customer',
    points: user?.points || 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="relative w-full max-w-md p-6 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {user ? `Edit ${user.name}` : 'User Details'}
            </h3>
            <button onClick={onClose} className="p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Reward Points
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-md shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
