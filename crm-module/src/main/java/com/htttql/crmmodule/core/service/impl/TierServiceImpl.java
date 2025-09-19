package com.htttql.crmmodule.core.service.impl;

import com.htttql.crmmodule.core.dto.TierRequest;
import com.htttql.crmmodule.core.dto.TierResponse;
import com.htttql.crmmodule.core.entity.Tier;
import com.htttql.crmmodule.core.repository.ITierRepository;
import com.htttql.crmmodule.core.service.ITierService;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TierServiceImpl implements ITierService {

    private final ITierRepository tierRepository;

    @Override
    public Page<TierResponse> getAllTiers(Pageable pageable) {
        Page<Tier> tiers = tierRepository.findAll(pageable);
        return tiers.map(this::mapToResponse);
    }

    @Override
    public TierResponse getTierById(Long id) {
        Tier tier = tierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tier not found with id: " + id));
        return mapToResponse(tier);
    }

    @Override
    public TierResponse createTier(TierRequest request) {
        Map<String, Object> benefits = new java.util.HashMap<>();
        benefits.put("description", request.getName());
        benefits.put("discountRate", request.getDiscountRate());

        Tier tier = Tier.builder()
                .code(request.getCode())
                .minPoints(request.getMinPoints())
                .benefits(benefits)
                .build();

        Tier savedTier = tierRepository.save(tier);
        return mapToResponse(savedTier);
    }

    @Override
    public TierResponse updateTier(Long id, TierRequest request) {
        Tier tier = tierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tier not found with id: " + id));

        Map<String, Object> benefits = new java.util.HashMap<>();
        benefits.put("description", request.getName());
        benefits.put("discountRate", request.getDiscountRate());

        tier.setCode(request.getCode());
        tier.setMinPoints(request.getMinPoints());
        tier.setBenefits(benefits);

        Tier updatedTier = tierRepository.save(tier);
        return mapToResponse(updatedTier);
    }

    @Override
    public void deleteTier(Long id) {
        if (!tierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tier not found with id: " + id);
        }
        tierRepository.deleteById(id);
    }

    private TierResponse mapToResponse(Tier tier) {
        return TierResponse.builder()
                .tierId(tier.getTierId())
                .code(tier.getCode().name())
                .minSpent(tier.getMinSpent())
                .minPoints(tier.getMinPoints())
                .benefits(tier.getBenefits())
                .createdAt(tier.getCreatedAt())
                .build();
    }
}
