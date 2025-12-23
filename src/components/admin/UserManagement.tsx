import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserPlus, Trash2, Search, Crown, Shield, User as UserIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: AppRole[];
}

const USERS_PER_PAGE = 10;

type RoleFilter = 'all' | AppRole | 'none';

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [assigningRole, setAssigningRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; role: AppRole; username: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Load profiles with pagination
      const from = (currentPage - 1) * USERS_PER_PAGE;
      const to = from + USERS_PER_PAGE - 1;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (profilesError) throw profilesError;

      // Load all user roles for the fetched users
      const userIds = (profilesData || []).map(p => p.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((profile) => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        roles: (rolesData || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      setAssigningRole(userId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === '23505') {
          toast.error('User already has this role');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Assigned ${role} role successfully`);
      await loadUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAssigningRole(null);
    }
  };

  const handleRemoveRoleClick = (userId: string, role: AppRole, username: string) => {
    if (role === 'admin') {
      setConfirmRemove({ userId, role, username });
    } else {
      removeRole(userId, role);
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      setAssigningRole(userId);
      setConfirmRemove(null);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Removed ${role} role successfully`);
      await loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    } finally {
      setAssigningRole(null);
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'moderator':
        return <Shield className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Filter by search query
  const searchFilteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Filter by role
  const filteredUsers = searchFilteredUsers.filter((user) => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'none') return user.roles.length === 0;
    return user.roles.includes(roleFilter);
  });

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">User Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} total user{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as RoleFilter)}
            >
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="moderator">Moderators</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="none">No Roles</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {searchQuery || roleFilter !== 'all' 
              ? 'No users found matching your filters' 
              : 'No users found'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Username</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="text-muted-foreground">Roles</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">@{user.username}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          No roles
                        </Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role) as any}
                            className="flex items-center gap-1"
                          >
                            {getRoleIcon(role)}
                            {role}
                            <button
                              onClick={() => handleRemoveRoleClick(user.id, role, user.display_name || user.username)}
                              disabled={assigningRole === user.id}
                              className="ml-1 hover:text-destructive transition-colors"
                              aria-label={`Remove ${role} role`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value as AppRole)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignRole(user.id, selectedRole)}
                        disabled={assigningRole === user.id || user.roles.includes(selectedRole)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Admin Role Removal Confirmation Dialog */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-destructive" />
              Remove Admin Role?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove the <strong>admin</strong> role from{' '}
              <strong>{confirmRemove?.username}</strong>. This will revoke their administrative privileges.
              <br /><br />
              This action can be undone by reassigning the role later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && removeRole(confirmRemove.userId, confirmRemove.role)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Admin Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
