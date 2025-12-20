import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamsPage } from '@/hooks/useTeamsPage';
import { TeamStatsCards, TeamCard } from '@/components/teams';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Users, Plus, Search, Loader2 } from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const TeamsContent = memo(function TeamsContent() {
  const { t } = useTranslation();
  const {
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    isMembersDialogOpen, setIsMembersDialogOpen,
    editingTeam, deletingTeam, setDeletingTeam,
    selectedTeam, teamMembers,
    formData, setFormData,
    teams, employees, stats,
    isLoading, isLoadingMembers,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleViewMembers,
  } = useTeamsPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title={t('teams.title')} description={t('teams.subtitle')}>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('teams.addTeam')}
        </Button>
      </PageHeader>

      <TeamStatsCards stats={stats} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder={t('teams.searchPlaceholder')} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('employees.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="active">{t('common.active')}</SelectItem>
            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('teams.noTeams')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onEdit={handleOpenEdit} 
              onDelete={(t) => { setDeletingTeam(t); setIsDeleteDialogOpen(true); }} 
              onViewMembers={handleViewMembers} 
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? t('teams.editTeam') : t('teams.addTeam')}
            </DialogTitle>
            <DialogDescription>{t('teams.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('teams.name')}</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('teams.description')}</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('teams.leader')}</Label>
              <Select 
                value={formData.manager_id || ''} 
                onValueChange={(v) => setFormData({ ...formData, manager_id: v || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('common.active')}</Label>
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTeam ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('teams.members')} - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              {teamMembers.length} {t('teams.members').toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          {isLoadingMembers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('common.noData')}</p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{member.employee.name}</p>
                      <p className="text-sm text-muted-foreground">{member.employee.email}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        title={t('teams.deleteTeam')} 
        description={`${t('teams.confirmDelete')} "${deletingTeam?.name}"?`} 
        onConfirm={handleDelete} 
        isLoading={isDeleting} 
        variant="destructive" 
      />
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function Teams() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <TeamsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
