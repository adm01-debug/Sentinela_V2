import React from 'react';
import { useTranslation } from 'react-i18next';
export const Page: React.FC = () => {
  const { t } = useTranslation();
  return (<div className="p-6"><h1 className="text-2xl font-bold">{t('page.title')}</h1></div>);
};
export default Page;
