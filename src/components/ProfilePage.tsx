import React from "react";
import ProfileForm from "./ProfileForm";
import { useUser } from "../contexts/UserContext";

interface ProfilePageProps {
  onDone: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onDone }) => {
  const { token } = useUser();
  if (!token) return <div>Loading...</div>;
  return (
    <div style={{ padding: 24, width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <ProfileForm token={token} onDone={onDone} />
    </div>
  );
};

export default ProfilePage;
