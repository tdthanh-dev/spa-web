package com.htttql.crmmodule.service.repository;

import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.service.entity.CasePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICasePhotoRepository extends JpaRepository<CasePhoto, Long> {
    List<CasePhoto> findByCustomerCase_CaseId(Long caseId);
    List<CasePhoto> findByCustomerCase_CaseIdAndType(Long caseId, PhotoType type);
}
