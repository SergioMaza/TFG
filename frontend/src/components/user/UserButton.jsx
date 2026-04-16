import { UserRound } from "lucide-react";

export default function UserButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-10 h-10 rounded-full secondary-button"
    >
      <UserRound size={20} />
    </button>
  );
}