import { store, setTokens, clearTokens, setProfile, updateProfile, clearProfile } from '../../store';

describe('Redux Store', () => {
  beforeEach(() => {
    // Reset store state
    store.dispatch(clearTokens());
    store.dispatch(clearProfile());
  });

  describe('Auth Slice', () => {
    it('should set tokens and isLoggedIn to true', () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      store.dispatch(setTokens(tokens));
      const state = store.getState().auth;

      expect(state.accessToken).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.isLoggedIn).toBe(true);
    });

    it('should clear tokens and set isLoggedIn to false', () => {
      store.dispatch(setTokens({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }));

      store.dispatch(clearTokens());
      const state = store.getState().auth;

      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });

    it('should have initial state with no tokens', () => {
      const state = store.getState().auth;

      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });
  });

  describe('User Slice', () => {
    it('should set user profile', () => {
      const profile = {
        id: 1,
        email: 'test@email.com',
        username: 'testUser',
        profileImage: 'image.jpg',
        notificationEnabled: true,
        role: 'MEMBER',
      };

      store.dispatch(setProfile(profile));
      const state = store.getState().user;

      expect(state.profile).toEqual(profile);
    });

    it('should update user profile partially', () => {
      store.dispatch(setProfile({
        id: 1,
        email: 'test@email.com',
        username: 'testUser',
        profileImage: 'image.jpg',
        notificationEnabled: true,
        role: 'MEMBER',
      }));

      store.dispatch(updateProfile({ username: 'newUsername' }));
      const state = store.getState().user;

      expect(state.profile?.username).toBe('newUsername');
      expect(state.profile?.email).toBe('test@email.com');
    });

    it('should not update profile if profile is null', () => {
      store.dispatch(updateProfile({ username: 'newUsername' }));
      const state = store.getState().user;

      expect(state.profile).toBeNull();
    });

    it('should clear user profile', () => {
      store.dispatch(setProfile({
        id: 1,
        email: 'test@email.com',
        username: 'testUser',
        profileImage: null,
        notificationEnabled: true,
        role: 'MEMBER',
      }));

      store.dispatch(clearProfile());
      const state = store.getState().user;

      expect(state.profile).toBeNull();
    });

    it('should have initial state with no profile', () => {
      const state = store.getState().user;

      expect(state.profile).toBeNull();
    });
  });
});
