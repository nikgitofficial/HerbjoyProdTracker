"use client";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-8 h-8 text-xs",
  lg: "w-14 h-14 text-lg",
};

export function UserAvatar({ image, name, size = "sm", className = "" }: UserAvatarProps) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  const sizeClass = SIZE_MAP[size];

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className={`${sizeClass} rounded-lg object-cover border border-surface-700 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-brand ${className}`}
    >
      {initials}
    </div>
  );
}