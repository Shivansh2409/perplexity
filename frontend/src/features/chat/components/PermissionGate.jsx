import React from "react";
import "./PermissionGate.css";

/**
 * PermissionGate Component
 * Conditionally renders content based on user's permission level
 */
export const PermissionGate = ({
  permission = "no-access",
  isOwner = false,
  requiredPermission = "view-only",
  children,
  fallback = null,
}) => {
  // Owner has full access
  if (isOwner) {
    return children;
  }

  // Check permission levels
  const permissionHierarchy = {
    "no-access": 0,
    "view-only": 1,
    edit: 2,
  };

  const hasPermission =
    permissionHierarchy[permission] >= permissionHierarchy[requiredPermission];

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

/**
 * PermissionDenied Component
 * Renders when user lacks required permissions
 */
export const PermissionDenied = ({ permission = "no-access", chatTitle }) => {
  const getMessage = () => {
    if (permission === "no-access") {
      return "You don't have access to this chat. Request access from the owner.";
    }
    if (permission === "view-only") {
      return "You have view-only access to this chat. Ask the owner to upgrade your permissions.";
    }
    return "You don't have permission to perform this action.";
  };

  return (
    <div className="permission-denied">
      <div className="denied-icon">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <p className="denied-message">{getMessage()}</p>
    </div>
  );
};

export default PermissionGate;
