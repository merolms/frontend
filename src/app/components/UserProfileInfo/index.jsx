const UserProfileInfo = ({ image, primaryText, secondaryText }) => {
  return (
    <div className="user-profile-container">
      <img src={image} alt={primaryText} className="user-profile-image" />
      <div className="user-profile-details">
        <div className="user-profile-details-header">{primaryText}</div>
        <div className="user-profile-details-subtitle">{secondaryText}</div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
