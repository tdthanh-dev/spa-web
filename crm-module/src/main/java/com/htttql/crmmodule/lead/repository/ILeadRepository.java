package com.htttql.crmmodule.lead.repository;

import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.entity.Lead;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ILeadRepository extends JpaRepository<Lead, Long> {
    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

}