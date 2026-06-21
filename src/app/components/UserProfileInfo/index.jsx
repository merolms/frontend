import PropTypes from "prop-types";

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

UserProfileInfo.propTypes = {
  image: PropTypes.string,
  primaryText: PropTypes.string,
  secondaryText: PropTypes.string,
};

export default UserProfileInfo;
