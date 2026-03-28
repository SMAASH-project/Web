import { motion } from "motion/react";
import type { Transition } from "motion/react";
import UserList from "./UserList";
import UserDetail from "./UserDetail";
import ProfilesPanel from "./ProfilesPanel";
import BanDialog from "./ban/BanDialog";
import { useAdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";

const colTransition = (delay: number): Transition => ({
  duration: 0.4,
  ease: "easeOut",
  delay,
});

export function AdminPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const logic = useAdminPageLogic();
  const cardBg = animReady
    ? logic.cardBg
    : logic.cardBg.replace(/backdrop-blur-\S+/g, "");

  const hidden = { opacity: 0, y: 18 };
  const visible = { opacity: 1, y: 0 };

  return (
    <>
      <div
        className={`z-0 flex flex-col xl:flex-row w-full max-w-7xl p-4 sm:p-6 gap-4 sm:gap-6 min-h-150 rounded-xl ${cardBg}`}
      >
        <motion.div
          initial={hidden}
          animate={animReady ? visible : hidden}
          transition={colTransition(0.05)}
        >
          <UserList logic={logic} />
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col gap-4 min-w-0"
          initial={hidden}
          animate={animReady ? visible : hidden}
          transition={colTransition(0.18)}
        >
          <UserDetail logic={logic} />
        </motion.div>

        <motion.div
          initial={hidden}
          animate={animReady ? visible : hidden}
          transition={colTransition(0.31)}
        >
          <ProfilesPanel logic={logic} />
        </motion.div>
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
