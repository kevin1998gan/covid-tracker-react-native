import { useState } from 'react';

import { AppException } from '@covid/core/api/ApiServiceErrors';
import i18n from '@covid/locale/i18n';
import { offlineService } from '@covid/Services';
import { Services } from '@covid/provider/services.types';
import { ICoreService } from '@covid/core/user/UserService';
import { useInjection } from '@covid/provider/services.hooks';
import { Profile } from '@covid/components/Collections/ProfileList';

export const useProfileList = () => {
  const userService = useInjection<ICoreService>(Services.User);

  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<AppException | null>(null);
  const [isApiError, setIsApiError] = useState<boolean>(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const retryListProfiles = () => {
    setStatus(i18n.t('errors.status-retrying'));
    setError(null);
    setTimeout(() => listProfiles(), offlineService.getRetryDelay());
  };

  const listProfiles = async () => {
    setStatus(i18n.t('errors.status-loading'));
    setError(null);

    try {
      const profiles = await userService.listPatients();
      if (profiles) {
        setProfiles(profiles);
        setIsLoaded(true);
      }
    } catch (error) {
      setError(error);
    }
  };

  return {
    status,
    error,
    isApiError,
    isLoaded,
    profiles,
    listProfiles,
    retryListProfiles,
    setIsApiError,
    setError,
  };
};
