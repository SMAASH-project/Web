import UserList from "./UserList";
import UserDetail from "./UserDetail";
import ProfilesPanel from "./ProfilesPanel";
import BanDialog from "./ban/BanDialog";
import { useAdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { sectionStyle } from "@/lib/utils";

export function AdminPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const logic = useAdminPageLogic();
  const cardBg = animReady
    ? logic.cardBg
    : logic.cardBg.replace(/backdrop-blur-\S+/g, "");

  return (
    <>
      <div
        className={`z-0 flex flex-col xl:flex-row w-full max-w-7xl p-4 sm:p-6 gap-4 sm:gap-6 min-h-150 rounded-xl ${cardBg}`}
      >
        <div style={sectionStyle(animReady, 0)}>
          <UserList logic={logic} />
        </div>
        <div
          className="flex-1 flex flex-col gap-4 min-w-0"
          style={sectionStyle(animReady, 80)}
        >
          <UserDetail logic={logic} />
        </div>
        <div style={sectionStyle(animReady, 160)}>
          <ProfilesPanel logic={logic} />
        </div>
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
