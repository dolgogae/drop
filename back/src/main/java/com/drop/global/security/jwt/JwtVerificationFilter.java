package com.drop.global.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.drop.global.redis.RedisUtils;
import com.drop.global.code.error.ErrorResponse;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JwtVerificationFilter extends OncePerRequestFilter {
    // 인증에서 제외할 url
    private static final List<String> EXCLUDE_URL =
            List.of("/",
                    "/h2",
                    "/members/signup",
                    "/auth/login",
                    "/auth/reissue");
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisUtils redisUtils;

    // JWT 인증 정보를 현재 쓰레드의 SecurityContext에 저장(가입/로그인/재발급 Request 제외)
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String accessToken = jwtTokenProvider.resolveAccessToken(request);
            log.info("[JwtVerificationFilter] URI: {}, Token exists: {}", request.getRequestURI(), accessToken != null);
            if (StringUtils.hasText(accessToken) && doNotLogout(accessToken)
                    && jwtTokenProvider.validateToken(accessToken, response)) {
                setAuthenticationToContext(accessToken);
                log.info("[JwtVerificationFilter] Authentication set successfully");
            } else {
                log.warn("[JwtVerificationFilter] Authentication NOT set - token: {}, doNotLogout: {}",
                    accessToken != null, accessToken != null ? doNotLogout(accessToken) : "N/A");
            }
            // TODO: 예외처리 리팩토링
        } catch (RuntimeException e) {
            log.error("[JwtVerificationFilter] Exception occurred: {}", e.getMessage(), e);
            if (e instanceof BusinessException) {
                ObjectMapper objectMapper = new ObjectMapper();
                String json = objectMapper.writeValueAsString(ErrorResponse.of(((BusinessException) e).getErrorCode()));
                response.getWriter().write(json);
                response.setStatus(((BusinessException) e).getErrorCode().getStatus());
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean doNotLogout(String accessToken) {
        String isLogout = redisUtils.getData(accessToken);
        // Redis에 데이터가 없으면(null) 로그아웃 안 한 상태
        return isLogout == null || "false".equals(isLogout);
    }

    // EXCLUDE_URL과 동일한 요청이 들어왔을 경우, 현재 필터를 진행하지 않고 다음 필터 진행
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        boolean result = EXCLUDE_URL.stream().anyMatch(exclude -> exclude.equalsIgnoreCase(request.getServletPath()));

        return result;
    }

    private void setAuthenticationToContext(String accessToken) {
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.info("# Token verification success!");
    }
}