import { newsPosts } from "@/lib/PageTypes";
import { formatDateTime } from "@/lib/utils";
import Navbar from "../../nav/Navbar";
import { Card } from "@/components/ui/card";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { Label } from "@/components/ui/label";
import { AddNews } from "./mainPageComponents/AddNews";
import { RemoveButton } from "./mainPageComponents/RemoveButton";
import { EditButton } from "./mainPageComponents/EditButton";
import { ButtonGroup } from "@/components/ui/button-group";
export function NewsPage() {
  const { settings } = useSettings();
  return (
    <div className="p-4">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-5">
        <span className="flex flex-row w-full justify-between">
          <AddNews />
          <Label
            className={`text-white text-lg ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""} text-center`}
          >
            Latest News
          </Label>
        </span>
        <ul className="list-disc pl-5">
          {newsPosts.map((post) => (
            <Card
              className={`z-0 flex flex-row p-10 mb-5 max-w-full max-h-lg ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20" : "bg-gray-600 border-2 border-green-400"}`}
              key={post.id}
            >
              <li className="flex flex-col gap-2">
                <span className="flex flex-row w-full justify-between">
                  <Label
                    className={`text-white text-lg ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""} text-left`}
                  >
                    {post.title}
                  </Label>
                  <Label
                    className={`text-white text-lg ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""} italic text-right`}
                  >
                    {formatDateTime(post.createdAt)}
                  </Label>
                  <ButtonGroup>
                    <EditButton />
                    <RemoveButton />
                  </ButtonGroup>
                </span>
                <Label
                  className={`text-white text-sm ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""} text-justify`}
                >
                  {post.content}
                </Label>
              </li>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  );
}
