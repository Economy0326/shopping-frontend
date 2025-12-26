// Minimal UsersAPI stub to satisfy imports during development
// Replace with real HTTP calls when backend is available.
export const UsersAPI = {
  saveDefault: async (payload) => {
    // pretend we saved and return success
    return Promise.resolve({ success: true });
  },
  updateProfile: async (payload) => {
    // return updated user-like object for UI
    return Promise.resolve({ user: { ...payload } });
  },
  changePassword: async (payload) => {
    // no-op success
    return Promise.resolve({ success: true });
  },
};

export default UsersAPI;
