package com.dailyhealth.repository;

import com.dailyhealth.entity.Like;
import com.dailyhealth.entity.Topic;
import com.dailyhealth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndTopic(User user, Topic topic);
    boolean existsByUserAndTopic(User user, Topic topic);
    void deleteByUserAndTopic(User user, Topic topic);
    void deleteByTopicId(Long topicId);
}
