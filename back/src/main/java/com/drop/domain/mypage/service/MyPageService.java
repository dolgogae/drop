package com.drop.domain.mypage.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.mypage.dto.MyPageProfileDto;
import com.drop.domain.mypage.dto.NotificationSettingDto;
import com.drop.domain.mypage.dto.PasswordChangeRequestDto;
import com.drop.domain.mypage.dto.ProfileUpdateRequestDto;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.enums.UserRole;
import com.drop.global.redis.RedisUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MemberRepository memberRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisUtils redisUtils;

    @Value("${file.upload.path:./image}")
    private String uploadPath;

    @Transactional(readOnly = true)
    public MyPageProfileDto getMyProfile(Long userId, String userRole) {
        log.info("[MyPageService] getMyProfile called with userId: {}, userRole: {}", userId, userRole);

        UserRole role = UserRole.fromKey(userRole);

        if (role == UserRole.GYM) {
            CrossfitBox crossfitBox = crossfitBoxRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
            return MyPageProfileDto.builder()
                    .id(crossfitBox.getId())
                    .email(crossfitBox.getEmail())
                    .username(crossfitBox.getName())
                    .profileImage(null)
                    .notificationEnabled(true)
                    .role(crossfitBox.getRole().name())
                    .build();
        }

        Member member = findMemberById(userId);
        return MyPageProfileDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .username(member.getUsername())
                .profileImage(member.getProfileImage())
                .notificationEnabled(member.getNotificationEnabled())
                .role(member.getRole().name())
                .build();
    }

    @Transactional
    public void updateProfile(Long memberId, ProfileUpdateRequestDto dto) {
        Member member = findMemberById(memberId);
        member.updateUsername(dto.getUsername());
    }

    @Transactional
    public void changePassword(Long memberId, PasswordChangeRequestDto dto) {
        Member member = findMemberById(memberId);

        if (!passwordEncoder.matches(dto.getCurrentPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }

        member.updatePassword(passwordEncoder.encode(dto.getNewPassword()));
    }

    @Transactional
    public void logout(Long memberId, String accessToken) {
        Member member = findMemberById(memberId);
        member.clearTokens();

        // Redis에 토큰을 블랙리스트로 등록 (30분간 유지)
        redisUtils.setData("BL:" + accessToken, "logout", 1800000L);
    }

    @Transactional
    public void withdraw(Long memberId) {
        Member member = findMemberById(memberId);

        // 프로필 이미지 삭제
        if (member.getProfileImage() != null) {
            deleteProfileImageFile(member.getProfileImage());
        }

        memberRepository.delete(member);
    }

    @Transactional
    public void updateNotificationSetting(Long memberId, NotificationSettingDto dto) {
        Member member = findMemberById(memberId);
        member.updateNotificationEnabled(dto.getNotificationEnabled());
    }

    @Transactional
    public String uploadProfileImage(Long memberId, MultipartFile file) {
        validateImageFile(file);

        Member member = findMemberById(memberId);

        // 기존 이미지 삭제
        if (member.getProfileImage() != null) {
            deleteProfileImageFile(member.getProfileImage());
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadPath, fileName);

        try {
            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            log.error("Failed to upload profile image: {}", e.getMessage());
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        member.updateProfileImage(fileName);
        return fileName;
    }

    @Transactional
    public void deleteProfileImage(Long memberId) {
        Member member = findMemberById(memberId);

        if (member.getProfileImage() != null) {
            deleteProfileImageFile(member.getProfileImage());
            member.updateProfileImage(null);
        }
    }

    @Transactional
    public void setHomeBox(Long memberId, Long crossfitBoxId) {
        Member member = findMemberById(memberId);

        if (crossfitBoxId == null) {
            member.updateHomeBox(null);
        } else {
            CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.CROSSFIT_BOX_NOT_FOUND));
            member.updateHomeBox(crossfitBox);
        }
    }

    @Transactional(readOnly = true)
    public Long getHomeBoxId(Long memberId) {
        Member member = findMemberById(memberId);
        return member.getHomeBox() != null ? member.getHomeBox().getId() : null;
    }

    private Member findMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ErrorCode.INVALID_FILE_TYPE);
        }

        // 5MB 제한
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException(ErrorCode.FILE_SIZE_EXCEEDED);
        }
    }

    private void deleteProfileImageFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadPath, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete profile image: {}", fileName);
        }
    }
}
