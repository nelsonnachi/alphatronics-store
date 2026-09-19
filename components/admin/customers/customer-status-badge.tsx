import { AdminUser } from "@/lib/query/users/user-types";


type CustomerStatusBadgeProps = {
  user: AdminUser;
};

export function CustomerStatusBadge({
  user,
}: CustomerStatusBadgeProps) {
  if (user.isBanned) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        Banned
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
      Active
    </span>
  );
}