import { MenuIcon } from "lucide-react";
import React from "react";

function Header(props) {
  return (
    <div className="border-border bg-bg-surface flex h-14 items-center border-b px-4">
      <button
        className="text-text-secondary hover:bg-bg-surface-hover flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
        onClick={props.toggleVisibiltiy}
      >
        <MenuIcon size={20} />
      </button>
    </div>
  );
}

export default Header;
