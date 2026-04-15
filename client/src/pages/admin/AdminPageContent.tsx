import { motion } from "motion/react";
import type { Transition } from "motion/react";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import ProfilesPanel from "./components/ProfilesPanel";
import BanDialog from "./components/BanDialog";
import { useAdminPageLogic } from "@/pages/admin/useAdminPageLogic";
import { useSettings } from "@/pages/settings/SettingsContext";

const colTransition = (delay: number): Transition => ({
  duration: 0.4,
  ease: "easeOut",
  delay,
});

export function AdminPageContent({ animReady = true }: { animReady?: boolean }) {
  const logic = useAdminPageLogic();
  const { settings } = useSettings();
  const { useAnimations } = settings;
  const cardBg = animReady ? logic.cardBg : logic.cardBg.replace(/backdrop-blur-\S+/g, "");

  const hidden = { opacity: 0, y: 18 };
  const visible = { opacity: 1, y: 0 };

  return (
    <>
      <div
        className={`z-0 flex w-full max-w-7xl flex-col gap-3 rounded-xl p-3 sm:gap-5 sm:p-5 xl:min-h-150 xl:flex-row ${cardBg}`}
      >
        {useAnimations ? (
          <motion.div
            initial={hidden}
            animate={animReady ? visible : hidden}
            transition={colTransition(0.05)}
          >
            <UserList logic={logic} />
          </motion.div>
        ) : (
          <div>
            <UserList logic={logic} />
          </div>
        )}

        {useAnimations ? (
          <motion.div
            className="flex min-w-0 flex-1 flex-col gap-4"
            initial={hidden}
            animate={animReady ? visible : hidden}
            transition={colTransition(0.18)}
          >
            <UserDetail logic={logic} />
          </motion.div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <UserDetail logic={logic} />
          </div>
        )}

        {useAnimations ? (
          <motion.div
            initial={hidden}
            animate={animReady ? visible : hidden}
            transition={colTransition(0.31)}
          >
            <ProfilesPanel logic={logic} />
          </motion.div>
        ) : (
          <div>
            <ProfilesPanel logic={logic} />
          </div>
        )}
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
