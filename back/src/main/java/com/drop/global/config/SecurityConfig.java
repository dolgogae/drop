package com.drop.global.config;

import com.drop.domain.auth.service.UserService;
import com.drop.global.redis.RedisUtils;
import com.drop.global.security.AES128Service;
import com.drop.global.security.CustomAuthenticationEntryPoint;
import com.drop.global.security.CustomUserDetailsService;
import com.drop.global.security.handler.CustomAccessDeniedHandler;
import com.drop.global.security.handler.LoginFailureHandler;
import com.drop.global.security.handler.LoginSuccessHandler;
import com.drop.global.security.jwt.JwtAuthenticationFilter;
import com.drop.global.security.jwt.JwtTokenProvider;
import com.drop.global.security.jwt.JwtVerificationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static com.drop.global.enums.UserRole.*;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@RequiredArgsConstructor
@EnableWebSecurity
@Configuration
@Slf4j
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final AES128Service aes128Service;
    private final RedisUtils redisUtils;
    private final CustomUserDetailsService customUserDetailsService;

    private final static String[] permitAllUrl = {
            "/",
            "/h2-console",
            "/login/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/auth/**", "/user/**",
            "/crossfit-boxes/**", "/home/**",
            "/image/**"};

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{

        http
                .authenticationProvider(authenticationProvider())
                .headers(header -> header.frameOptions().sameOrigin())
                .csrf(AbstractHttpConfigurer::disable)
                .cors().configurationSource(corsConfigurationSource())
                .and()
                .formLogin().disable()
                .httpBasic().disable()
                .authorizeHttpRequests(auth -> auth
                        .antMatchers(permitAllUrl).permitAll()
                        .antMatchers("/admin/**").hasAnyRole(ADMIN.name())
                        .antMatchers("/fee/**").hasAnyRole(GYM.name(), ADMIN.name(), TRAINER.name())
                        .antMatchers("/schedule/**").hasAnyRole(GYM.name(), ADMIN.name())
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .exceptionHandling(exception
                        -> exception.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                        .accessDeniedHandler(new CustomAccessDeniedHandler()))
                .apply(new CustomFilterConfigurer());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false); // UsernameNotFoundException을 그대로 전달
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        // 우리가 만든 Provider만 사용하도록 명시적으로 설정
        return new ProviderManager(authenticationProvider());
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.addExposedHeader("Authorization");
        configuration.addExposedHeader("Refresh");
        configuration.addAllowedHeader("*");
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    public class CustomFilterConfigurer extends AbstractHttpConfigurer<CustomFilterConfigurer, HttpSecurity> {
        @Override
        public void configure(HttpSecurity builder) {
            log.info("SecurityConfiguration.CustomFilterConfigurer.configure execute");
            // 우리가 만든 AuthenticationManager Bean 사용
            JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(authenticationManager(),
                    jwtTokenProvider, aes128Service, userService, redisUtils);
            JwtVerificationFilter jwtVerificationFilter = new JwtVerificationFilter(jwtTokenProvider, redisUtils);

            jwtAuthenticationFilter.setFilterProcessesUrl("/auth/login");
            jwtAuthenticationFilter.setAuthenticationSuccessHandler(new LoginSuccessHandler());
            jwtAuthenticationFilter.setAuthenticationFailureHandler(new LoginFailureHandler());

            builder
                    .addFilter(jwtAuthenticationFilter)
                    .addFilterAfter(jwtVerificationFilter, JwtAuthenticationFilter.class);
        }
    }
}
