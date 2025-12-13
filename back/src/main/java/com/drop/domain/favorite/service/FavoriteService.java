package com.drop.domain.favorite.service;

import com.drop.domain.favorite.data.MemberGym;
import com.drop.domain.favorite.dto.FavoriteGymDto;
import com.drop.domain.favorite.dto.FavoriteRequestDto;
import com.drop.domain.favorite.repository.MemberGymRepository;
import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.repository.GymRepository;
import com.drop.domain.user.member.data.Member;
import com.drop.domain.user.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final MemberGymRepository memberGymRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;

    @Transactional(readOnly = true)
    public List<FavoriteGymDto> getMyGyms(Long memberId) {
        return memberGymRepository.findByMemberIdWithGym(memberId).stream()
                .map(this::toFavoriteGymDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FavoriteGymDto addGymToMyList(Long memberId, FavoriteRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(request.getGymId())
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        // 이미 등록되어 있는지 확인
        if (memberGymRepository.existsByMemberAndGym(member, gym)) {
            throw new IllegalArgumentException("이미 등록된 체육관입니다.");
        }

        MemberGym memberGym = MemberGym.create(member, gym, request.getIsFavorite());
        MemberGym saved = memberGymRepository.save(memberGym);

        return toFavoriteGymDto(saved);
    }

    @Transactional
    public FavoriteGymDto toggleFavorite(Long memberId, Long gymId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        MemberGym memberGym = memberGymRepository.findByMemberAndGym(member, gym)
                .orElseThrow(() -> new IllegalArgumentException("내 체육관 목록에 없습니다."));

        memberGym.toggleFavorite();

        return toFavoriteGymDto(memberGym);
    }

    @Transactional
    public void removeGymFromMyList(Long memberId, Long gymId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));

        memberGymRepository.deleteByMemberAndGym(member, gym);
    }

    private FavoriteGymDto toFavoriteGymDto(MemberGym memberGym) {
        Gym gym = memberGym.getGym();
        return FavoriteGymDto.builder()
                .gymId(gym.getId())
                .name(gym.getName())
                .location(gym.getLocation())
                .isFavorite(memberGym.getIsFavorite())
                .build();
    }
}
