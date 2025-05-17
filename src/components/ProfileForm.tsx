import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from 'react-hot-toast';

import { useTranslation } from 'react-i18next';
import TextInput from "./ui/TextInput";
import PrimaryButton from "./ui/PrimaryButton";

interface ProfileFormProps {
  token: string;
  onDone: () => void;
  showOnly?: 'status' | 'fields';
}


import { useLocation } from "react-router-dom";

const ProfileForm: React.FC<ProfileFormProps> = ({ token, onDone, showOnly }) => {
  // Alla hooks först!
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentSuccess = params.get("success");
  const paymentCanceled = params.get("canceled");
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
  // Fallback to Swedish
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

    } catch (err: any) {
      let errorMsg = "Failed to save profile.";
      if (err && err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === 'object' && err.response.data.error) {
          errorMsg = err.response.data.error;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err && err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      // Logga allt till konsolen för felsökning
      console.error("[ProfileForm] Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Loading/error/empty states EFTER hooks!
  if (loading) return <div>Loading profile...</div>;


  if (showOnly === 'status') {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.statusTitle', 'Din medlemsstatus:')}</label>
        <div
          className={`w-full px-3 py-2 border rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg flex items-center h-[40px] justify-center text-center appearance-none ${profile.role === 'ROLE_ADMIN' ? 'text-red-600' : profile.role === 'ROLE_EDUCATOR' ? 'text-red-600' : isPremium ? 'text-green-600' : 'text-blue-600'} mb-4`}
          onClick={() => {
            if (!isPremium && profile.role !== 'ROLE_EDUCATOR' && profile.role !== 'ROLE_ADMIN' && typeof (window as any).triggerPaywall === 'function') {
              (window as any).triggerPaywall();
            }
          }}
        >
          {profile.role === 'ROLE_ADMIN' ? (
            <span>{getLabel('profile.statusAdmin', 'Admin')}</span>
          ) : profile.role === 'ROLE_EDUCATOR' ? (
            <span>{getLabel('profile.statusEducator', 'Undervisande personal')}</span>
          ) : isPremium ? (
            <span>{getLabel('profile.statusPremium', 'Premium-användare')}</span>
          ) : (
            <span>{getLabel('profile.statusFree', 'Gratisanvändare')}</span>
          )}
        </div>
        {/* Betalningsknapp endast för gratisanvändare */}
        {!isPremium && profile.role !== 'ROLE_EDUCATOR' && profile.role !== 'ROLE_ADMIN' && (
          <PrimaryButton
            type="button"
            className="w-full mb-4"
            onClick={async () => {
              try {
                const res = await api.post("/api/v2/stripe/create-checkout-session");
                if (res.data && res.data.url) {
                  window.location.href = res.data.url;
                } else {
                  toast.error(getLabel('profile.paymentError', 'Kunde inte starta betalning.'));
                }
              } catch {
                toast.error(getLabel('profile.paymentError', 'Kunde inte starta betalning.'));
              }
            }}
          >
            {getLabel('profile.upgrade', 'Uppgradera till Premium')}
          </PrimaryButton>
        )}
      </div>
    );
  }
  if (showOnly === 'fields') {
    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
        {error && !(error.toLowerCase().includes('e-postadressen') || error.toLowerCase().includes('email')) && (
  <div style={{ color: "red" }}>{getLabel('profile.saveError', 'Failed to save profile.')}</div>
)}
        {success && <div style={{ color: "green" }}>{getLabel('profile.updated', 'Profile updated!')}</div>}
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.username', 'Användarnamn')}</label>
          <TextInput
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.email', 'E-post')}</label>
          <TextInput
            type="email"
            className="h-[40px]"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
          />
          {error && (error.toLowerCase().includes('e-postadressen') || error.toLowerCase().includes('email')) && (
            <div style={{ color: 'red', marginTop: 4 }}>{error}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.firstName', 'Förnamn')}</label>
          <TextInput
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.lastName', 'Efternamn')}</label>
          <TextInput
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4 flex items-center justify-center" style={{height:'40px'}}>
          <button type="submit" disabled={saving} style={{background:'none',border:'none',boxShadow:'none',padding:0,margin:0,height:'auto',width:'auto',lineHeight:'normal'}}>
            <span style={{border:'1px solid #bbb',borderRadius:4,padding:'2px 18px',background:'none',fontSize:'1rem',color:'inherit'}}>
              {saving ? getLabel('profile.saving', 'Sparar...') : getLabel('profile.save', 'Spara')}
            </span>
          </button>
        </div>
      </form>
    );
  }
  // Default: visa allt
  return (
    <>
      {paymentSuccess && (
        <div className="payment-success-message">
          {t('profile.paymentSuccess')}
        </div>
      )}
      {paymentCanceled && (
        <div className="payment-canceled-message">
          {t('profile.paymentCanceled')}
        </div>
      )}
      {/* Medlemsstatus högst upp */}
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.statusTitle', 'Din medlemsstatus:')}</label>
        <div
          className={`w-full px-3 py-2 border rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg flex items-center h-[40px] justify-center text-center appearance-none ${profile.role === 'ROLE_ADMIN' ? 'text-red-600' : profile.role === 'ROLE_EDUCATOR' ? 'text-red-600' : isPremium ? 'text-green-600' : 'text-blue-600'} mb-4`}
          onClick={() => {
            if (!isPremium && profile.role !== 'ROLE_EDUCATOR' && profile.role !== 'ROLE_ADMIN' && typeof (window as any).triggerPaywall === 'function') {
              (window as any).triggerPaywall();
            }
          }}
        >
          {profile.role === 'ROLE_ADMIN' ? (
            <span>{getLabel('profile.statusAdmin', 'Admin')}</span>
          ) : profile.role === 'ROLE_EDUCATOR' ? (
            <span>{getLabel('profile.statusEducator', 'Undervisande personal')}</span>
          ) : isPremium ? (
            <span>{getLabel('profile.statusPremium', 'Premium-användare')}</span>
          ) : (
            <span>{getLabel('profile.statusFree', 'Gratisanvändare')}</span>
          )}
        </div>
        {/* Betalningsknapp endast för gratisanvändare */}
        {!isPremium && profile.role !== 'ROLE_EDUCATOR' && profile.role !== 'ROLE_ADMIN' && (
          <PrimaryButton
            type="button"
            className="w-full mb-4"
            onClick={async () => {
              try {
                const res = await api.post("/api/v2/stripe/create-checkout-session");
                if (res.data && res.data.url) {
                  window.location.href = res.data.url;
                } else {
                  toast.error(getLabel('profile.paymentError', 'Kunde inte starta betalning.'));
                }
              } catch {
                toast.error(getLabel('profile.paymentError', 'Kunde inte starta betalning.'));
              }
            }}
          >
            {getLabel('profile.upgrade', 'Uppgradera till Premium')}
          </PrimaryButton>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
        {error && !(error.toLowerCase().includes('e-postadressen') || error.toLowerCase().includes('email')) && (
  <div style={{ color: "red" }}>{getLabel('profile.saveError', 'Failed to save profile.')}</div>
)}
        {success && <div style={{ color: "green" }}>{getLabel('profile.updated', 'Profile updated!')}</div>}
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.username', 'Användarnamn')}</label>
          <TextInput
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.email', 'E-post')}</label>
          <TextInput
            type="email"
            className="h-[40px]"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
          />
          {error && (error.toLowerCase().includes('e-postadressen') || error.toLowerCase().includes('email')) && (
            <div style={{ color: 'red', marginTop: 4 }}>{error}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.firstName', 'Förnamn')}</label>
          <TextInput
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{getLabel('profile.lastName', 'Efternamn')}</label>
          <TextInput
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4 flex items-center justify-center" style={{height:'40px'}}>
          <button type="submit" disabled={saving} style={{background:'none',border:'none',boxShadow:'none',padding:0,margin:0,height:'auto',width:'auto',lineHeight:'normal'}}>
            <span style={{border:'1px solid #bbb',borderRadius:4,padding:'2px 18px',background:'none',fontSize:'1rem',color:'inherit'}}>
              {saving ? getLabel('profile.saving', 'Sparar...') : getLabel('profile.save', 'Spara')}
            </span>
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileForm;
