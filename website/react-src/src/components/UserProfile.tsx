import React from 'react';

/**
 * Component for displaying user profile information
 * @param {Object} props
 * @param {string} props.email - User's email
 * @param {string} props.membership - User's membership type
 */
const UserProfile = ({ email, membership }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-indigo-500 mr-3 flex items-center justify-center text-white font-medium">
        {email ? email.charAt(0).toUpperCase() : 'U'}
      </div>
      <div>
        <p className="text-gray-200 font-medium">{email || 'User'}</p>
        <p className="text-xs text-gray-400">{membership}</p>
      </div>
    </div>
  );
};

export default UserProfile;
