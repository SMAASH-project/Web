import { useState } from "react";
import { Swords } from "lucide-react";
import { LoadPost } from "@/animations/LoadPost";

interface CharacterCardProps {
  character: { id: number; name: string };
  panelBg: string;
  textColor: string;
  subtextColor: string;
  animate: boolean;
  index: number;
}

export function CharacterCard({
  character,
  panelBg,
  textColor,
  subtextColor,
  animate,
  index,
}: CharacterCardProps) {
  const [imgError, setImgError] = useState(false);

  const card = (
    <div
      className={`flex flex-col overflow-hidden rounded-xl ${panelBg} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="relative aspect-square overflow-hidden bg-black/10">
        {!imgError ? (
          <img
            src={`/api/characters/${character.id}/img`}
            alt={character.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Swords className={`h-10 w-10 opacity-20 ${subtextColor}`} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className={`truncate text-sm font-semibold ${textColor}`}>{character.name}</p>
        <span className={`shrink-0 font-mono text-[10px] opacity-40 ${subtextColor}`}>
          #{character.id}
        </span>
      </div>
    </div>
  );

  return animate ? <LoadPost index={index}>{card}</LoadPost> : <div>{card}</div>;
}
