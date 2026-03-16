import UserList from "./UserList";
import UserDetail from "./UserDetail";
import ProfilesPanel from "./ProfilesPanel";
import BanDialog from "./ban/BanDialog";
import { useAdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";

export function AdminPageContent() {
  const logic = useAdminPageLogic();

  return (
    <>
      <div
        className={`z-0 flex flex-col xl:flex-row w-full max-w-7xl p-4 sm:p-6 gap-4 sm:gap-6 min-h-150 rounded-xl ${logic.cardBg}`}
      >
        <UserList logic={logic} />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <UserDetail logic={logic} />
        </div>
        <ProfilesPanel logic={logic} />
      </div>

      {logic.selectedUser && (
        <BanDialog
          open={logic.banDialogOpen}
          onOpenChange={logic.setBanDialogOpen}
          user={logic.selectedUser}
          onConfirm={logic.handleBanConfirm}
          isLoading={logic.banMutation.isPending}
        />
      )}
    </>
  );
}

export default AdminPageContent;
