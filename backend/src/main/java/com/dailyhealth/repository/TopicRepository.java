package com.dailyhealth.repository;

import com.dailyhealth.entity.Topic;
import com.dailyhealth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    Page<Topic> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Topic> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT t FROM Topic t LEFT JOIN FETCH t.comments WHERE t.id = :id")
    Optional<Topic> findByIdWithComments(@Param("id") Long id);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.topic.id = :topicId")
    Long countLikesByTopicId(@Param("topicId") Long topicId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.topic.id = :topicId")
    Long countCommentsByTopicId(@Param("topicId") Long topicId);
}
