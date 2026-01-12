import { useModalStore } from '@/stores/modalStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirmDialog } = useModalStore();
  if (!confirmDialog) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  return (
    <Dialog open={!!confirmDialog} onOpenChange={closeConfirmDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">{confirmDialog.message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={closeConfirmDialog}>
            {confirmDialog.cancelText || 'Cancelar'}
          </Button>
          <Button variant={confirmDialog.variant || 'default'} onClick={handleConfirm}>
            {confirmDialog.confirmText || 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
