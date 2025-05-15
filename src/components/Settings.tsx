import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PrimaryButton from "./ui/PrimaryButton";
import { useTranslation } from 'react-i18next';

interface SettingsProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC = () => null;
export default Settings;