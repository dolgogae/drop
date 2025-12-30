package com.drop.global.security;

import com.drop.global.enums.UserRole;

/**
 * Interface for entities that can authenticate.
 * Both Member and Gym implement this interface.
 */
public interface Authenticatable {
    Long getId();
    String getUsername();
    String getEmail();
    String getPassword();
    UserRole getRole();
    String getAccessToken();
    String getRefreshToken();
    void setTokens(String accessToken, String refreshToken);
}
