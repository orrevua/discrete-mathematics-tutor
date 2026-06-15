import { LEVEL_CLASS } from "@/lib/constants";
import type { Level } from "@/lib/types";

export default function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge ${LEVEL_CLASS[level]}`}>{level}</span>;
}
