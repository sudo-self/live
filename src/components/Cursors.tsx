import React, { useState } from "react";
import { useCursors } from "@ably/spaces/react";

import type { CursorUpdate as _CursorUpdate } from "@ably/spaces";
import CursorSvg from "./CursorSvg";
import useTrackCursor from "../hooks/useTrackCursor";
import { Member } from "../utils/types";

import styles from "./Cursors.module.css";

// 💡 This component is used to render the cursor of the user
const YourCursor = ({
  self,
  parentRef,
}: {
  self: Member | null;
  parentRef: React.RefObject<HTMLDivElement>;
}) => {
  const [cursorPosition, setCursorPosition] = useState<{
    left: number;
    top: number;
    state: string;
  } | null>(null);
  const handleSelfCursorMove = useTrackCursor(setCursorPosition, parentRef);
  if (!self) return null;
  if (!cursorPosition || cursorPosition.state === "leave") return null;

  const { cursorColor } = self.profileData.userColors;

  return (
    <div
      className={styles.cursor}
      onMouseMove={(e) => handleSelfCursorMove(e)}
      style={{
        top: `${cursorPosition?.top || 0}px`,
        left: `${cursorPosition?.left || 0}px`,
      }}
    >
      <CursorSvg cursorColor={cursorColor} />
      <div
        style={{ backgroundColor: cursorColor }}
        className={styles.cursorName}
      >
        You
      </div>
    </div>
  );
};

type CursorUpdate = Omit<_CursorUpdate, "data"> & {
  data: { state: "move" | "leave" };
};

// 💡 This component is used to render the cursors of other users in the space
const MemberCursors = () => {
  const { cursors } = useCursors({ returnCursors: true });

  return (
    <>
      {Object.values(cursors).map((data) => {
        const cursorUpdate = data.cursorUpdate as CursorUpdate;
        const member = data.member as Member;
        if (cursorUpdate.data.state === "leave") return;
        const { cursorColor } = member.profileData.userColors;
        return (
          <div
            key={member.connectionId}
            id={`member-cursor-${member.connectionId}`}
            className={styles.cursor}
            style={{
              left: `${cursorUpdate.position.x}px`,
              top: `${cursorUpdate.position.y}px`,
            }}
          >
            <CursorSvg cursorColor={cursorColor} />
            <div
              style={{ backgroundColor: cursorColor }}
              className={`${styles.cursorName} member-cursor`}
            >
              {member.profileData.name}
            </div>
          </div>
        );
      })}
    </>
  );
};

export { MemberCursors, YourCursor };
