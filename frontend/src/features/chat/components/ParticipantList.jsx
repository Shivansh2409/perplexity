import React from "react";

/**
 * ParticipantList Component
 * Shows all participants and their permission levels
 * Only visible to chat owner
 */
export const ParticipantList = ({
  participants = [],
  permissions = {},
  chatOwner,
  isOwner = false,
  onPermissionChange,
  loading = false,
}) => {
  const getPermissionBadgeClass = (permission) => {
    return `permission-badge ${permission.replace("-", "-")}`;
  };

  const handlePermissionChange = (userId, newPermission) => {
    onPermissionChange?.(userId, newPermission);
  };

  return (
    <div className="p-4 space-y-4 divide-y divide-gray-800/30">
      <div className="pb-4 border-b border-gray-800/30 mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">
          Participants ({participants.length})
        </h3>
      </div>

      <div className="pt-4 divide-y divide-gray-800/20">
        {participants.map((participant) => {
          const isOwnerParticipant = participant._id === chatOwner?._id || participant._id === chatOwner;
          const currentPermission = permissions[participant._id] || "no-access";
          console.log(participant);

          return (
            <div
              key={participant._id}
              className="flex items-center justify-between py-4 first:pt-0"
            >
              <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-100 truncate flex items-center gap-1.5">
                  {participant.username}
                  {isOwnerParticipant && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 font-mono">
                      Owner
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {participant.email}
                </p>
              </div>

              <div className="flex-shrink-0 ml-4">
                {isOwner && !isOwnerParticipant ? (
                  <select
                    value={currentPermission}
                    onChange={(e) =>
                      handlePermissionChange(participant._id, e.target.value)
                    }
                    disabled={loading}
                    className="bg-gray-900/50 border border-gray-700 hover:border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-100 transition-all shadow-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="no-access">No Access</option>
                    <option value="view-only">View Only</option>
                    <option value="edit">Edit</option>
                  </select>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                      currentPermission === "no-access"
                        ? "bg-gray-900/50 border-gray-700 text-gray-400"
                        : currentPermission === "view-only"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {currentPermission === "no-access"
                      ? "No Access"
                      : currentPermission === "view-only"
                        ? "View Only"
                        : "Edit"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
