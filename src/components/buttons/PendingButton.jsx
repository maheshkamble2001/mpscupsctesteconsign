import { Clock } from "lucide-react";

const PendingButton = ({ children = "Pending", onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-white"
      style={{
        padding: "4px 9px",
        fontSize: "12px",
        borderRadius: "3px",
        backgroundColor: "rgb(253, 175, 25)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3969b8")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgb(253, 175, 25)")}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{children}</span>
    </button>
  );
};

export default PendingButton;
