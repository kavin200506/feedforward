package com.feedforward.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.feedforward.entity.User;
import com.feedforward.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password;
    private final String name;
    private final String role;
    private final Boolean isActive;

    // Create CustomUserDetails from User entity
    public static CustomUserDetails build(User user) {
        return new CustomUserDetails(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getRole().name(),
                user.getIsActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    // Explicit getter methods (Lombok @Getter should generate these, but adding explicitly for IDE compatibility)
    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    // Helper method to check if user has specific role
    public boolean hasRole(Role role) {
        return this.role.equals(role.name());
    }
}


