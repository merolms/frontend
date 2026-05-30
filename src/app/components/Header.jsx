import React from 'react';
import { MenuIcon } from 'lucide-react';

function Header(props) {
  return (
    <div className="flex h-14 items-center border-b border-border bg-bg-surface px-4">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg-surface-hover transition-colors cursor-pointer"
        onClick={props.toggleVisibiltiy}
      >
        <MenuIcon size={20} />
      </button>
    </div>
  );
}

export default Header;
