import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from 'react-hot-toast';

import { useTranslation } from 'react-i18next';
import TextInput from "./ui/TextInput";

interface ProfileFormProps {
  token: string;
  onDone: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ token, onDone }) => {
  // Alla hooks först!
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "ROLE_USER",
    userGroup: "",
    stripeCustomerId: "",
    stripeSubscriptionId: ""
  });
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { t, i18n } = useTranslation();
  // Fallback till svenska om översättning saknas
  const getLabel = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v2/users/me");
        console.log("[ProfileForm] Backend response:", res.data);
        setProfile({
          username: res.data.username || "",
          email: res.data.email || "",
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          role: res.data.role || "ROLE_USER",
          userGroup: res.data.userGroup || "",
          stripeCustomerId: res.data.stripeCustomerId || "",
          stripeSubscriptionId: res.data.stripeSubscriptionId || ""
        });
        setIsPremium(!!res.data.isPremium);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.patch(
        "/api/v2/users/me",
        {
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName
        }
      );
      setSuccess(true);
      toast.success(getLabel('profile.updated', 'Profilen har uppdaterats!'));
      // Stanna kvar på profilsidan, ingen redirect

    } catch (err) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Loading/error/empty states EFTER hooks!
  if (loading) return <div>Loading profile...</div>;


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>{getLabel('profile.title', 'Dina användaruppgifter')}</h2>
      {error && <div style={{ color: "red" }}>{getLabel('profile.saveError', 'Misslyckades att spara profilen.')}</div>}
      {success && <div style={{ color: "green" }}>{getLabel('profile.updated', 'Profilen har uppdaterats!')}</div>}
      <div style={{ marginBottom: 16 }}>
        <label>{getLabel('profile.username', 'Användarnamn')}<br />
          <TextInput
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>{getLabel('profile.email', 'E-post')}<br />
          <TextInput
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
            // readonly={true} // Avkommentera denna rad om e-post inte får ändras
          />
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>{getLabel('profile.firstName', 'Förnamn')}<br />
          <TextInput
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>{getLabel('profile.lastName', 'Efternamn')}<br />
          <TextInput
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={saving} style={{ width: "100%" }}>
        {saving ? getLabel('profile.saving', 'Sparar...') : getLabel('profile.save', 'Spara')}
      </button>

      <div className="mt-8">
        <div className="font-medium mb-2 text-left">{getLabel('profile.statusTitle', 'Din medlemsstatus:')}</div>
        <div className="w-full max-w-full rounded bg-gray-200 shadow-md px-4 py-4 flex items-center justify-center">
          {profile.role === 'ROLE_ADMIN' ? (
            <span className="text-red-600 font-semibold">{getLabel('profile.statusAdmin', 'Admin')}</span>
          ) : profile.role === 'ROLE_EDUCATOR' ? (
            <span className="text-blue-600 font-semibold">{getLabel('profile.statusEducator', 'Undervisande personal')}</span>
          ) : isPremium ? (
            <span className="text-green-600 font-semibold">{getLabel('profile.statusPremium', 'Betalande medlem')}</span>
          ) : (
            <span className="text-neutral-500 font-semibold">{getLabel('profile.statusFree', 'Gratis medlem')}</span>
          )}
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
