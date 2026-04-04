import React from "react";
import "./ParticipantList.css";

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
    <div className="participant-list">
      <div className="participant-list-header">
        <h3>Participants ({participants.length})</h3>
      </div>

      <div className="participants">
        {participants.map((participant) => {
          const isOwnerParticipant = participant._id === chatOwner?._id;
          const currentPermission = permissions[participant._id] || "no-access";

          return (
            <div key={participant._id} className="participant-item">
              <div className="participant-info">
                <p className="participant-name">
                  {participant.username}
                  {isOwnerParticipant && (
                    <span className="owner-badge">Owner</span>
                  )}
                </p>
                <p className="participant-email">{participant.email}</p>
              </div>

              <div className="participant-actions">
                {isOwner && !isOwnerParticipant ? (
                  <select
                    value={currentPermission}
                    onChange={(e) =>
                      handlePermissionChange(participant._id, e.target.value)
                    }
                    disabled={loading}
                    className="permission-select"
                  >
                    <option value="no-access">No Access</option>
                    <option value="view-only">View Only</option>
                    <option value="edit">Edit</option>
                  </select>
                ) : (
                  <span className={getPermissionBadgeClass(currentPermission)}>
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
