import type { ReactNode } from "react";

type AppHeaderProps = {
  subtitle?: string;
  actions?: ReactNode;
};

const AppHeader = ({ subtitle, actions }: AppHeaderProps) => {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-brand">Nexus AI</div>
        {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      </div>
      <div className="topbar-actions">
        <span className="topbar-status">
          <span className="status-dot" /> Multi-IA ativo
        </span>
        {actions}
      </div>
    </header>
  );
};

export default AppHeader;
