import React from "react";

import { useTranslation } from 'react-i18next';

const PhotoToQuizPlaceholder: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
            {t('photoToQuiz.placeholder')}
        </div>
    );
};

export default PhotoToQuizPlaceholder;
