import React from "react";
import PrimaryButton from "./ui/PrimaryButton";
import { useTranslation } from "react-i18next";

interface WelcomeScreenProps {
    firstName: string;
    onStartNew: () => void;
    onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
                                                         firstName,
                                                         onStartNew,
                                                         onContinue,
                                                     }) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex flex-col items-center justify-center px-4 py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100"
        >
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    {t("welcome")}, {firstName}!
                </h1>
                <p className="mb-8 text-gray-900 dark:text-white">{t("welcomeDescription")}</p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto">
                    <PrimaryButton className="w-full" onClick={onContinue}>
    {t("continueQuiz")}
</PrimaryButton>
                    <PrimaryButton className="w-full" onClick={onStartNew}>
    {t("startNewQuiz")}
</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;