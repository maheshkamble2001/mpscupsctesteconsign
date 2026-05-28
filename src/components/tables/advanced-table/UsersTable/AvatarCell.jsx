export const AvatarCell = ({ row }) => {
  const name = row.original.name || "";
  const image = row.original.profileImage;
  const initials = name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-center space-x-2">
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
      )}
      <span>{name}</span>
    </div>
  );
};
