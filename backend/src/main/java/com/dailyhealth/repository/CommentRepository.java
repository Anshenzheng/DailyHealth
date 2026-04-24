package com.dailyhealth.repository;

import com.dailyhealth.entity.Comment;
import com.dailyhealth.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTopicOrderByCreatedAtDesc(Topic topic);
    void deleteByTopicId(Long topicId);
}
