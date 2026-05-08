import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md",
        "bg-surface-900/80 backdrop-blur-xl",
        "border border-surface-800/80",
        "rounded-2xl shadow-glass-lg",
        "p-8",
        "animate-scale-in",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AuthCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCardHeader({ icon, title, subtitle }: AuthCardHeaderProps) {
  return (
    <div className="mb-8 text-center">
      {icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600/15 border border-brand-500/20 mb-4 text-brand-400">
          {icon}
        </div>
      )}
      <h1 className="text-xl font-semibold text-white tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-surface-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
