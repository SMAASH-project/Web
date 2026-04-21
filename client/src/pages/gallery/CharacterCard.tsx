import { useState } from "react";
import { Swords } from "lucide-react";
import { motion } from "motion/react";
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

  const cardInner = (
    <>
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
    </>
  );

  if (animate) {
    return (
      <LoadPost index={index}>
        <motion.div
          className={`flex flex-col overflow-hidden rounded-xl ${panelBg}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
        >
          {cardInner}
        </motion.div>
      </LoadPost>
    );
  }

  return <div className={`flex flex-col overflow-hidden rounded-xl ${panelBg}`}>{cardInner}</div>;
}
