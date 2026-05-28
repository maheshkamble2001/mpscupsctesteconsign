import { CheckCircle } from "lucide-react";

const CompletedButton = ({ children = "Pending", onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-white"
      style={{
        padding: "4px 9px",
        fontSize: "12px",
        borderRadius: "3px",
        backgroundColor: "#00a63e",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00a63e")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00a63e")}
    >
      <CheckCircle className="w-3.5 h-3.5" />
      <span>{children}</span>
    </button>
  );
};

export default CompletedButton;
