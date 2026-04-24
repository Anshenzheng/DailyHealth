package com.dailyhealth.service;

import com.dailyhealth.entity.Comment;
import com.dailyhealth.entity.Like;
import com.dailyhealth.entity.Topic;
import com.dailyhealth.entity.User;
import com.dailyhealth.repository.CommentRepository;
import com.dailyhealth.repository.LikeRepository;
import com.dailyhealth.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TopicService {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;

    public Page<Topic> getAllTopics(Pageable pageable) {
        return topicRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Optional<Topic> getTopicById(Long id) {
        return topicRepository.findByIdWithComments(id);
    }

    public List<Topic> getTopicsByUser(User user) {
        return topicRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Topic createTopic(Topic topic, User user) {
        topic.setUser(user);
        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(Long id, Topic topic, User user) {
        Topic existing = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("话题不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改此话题");
        }
        
        existing.setTitle(topic.getTitle());
        existing.setContent(topic.getContent());
        
        return topicRepository.save(existing);
    }

    @Transactional
    public void deleteTopic(Long id, User user) {
        Topic existing = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("话题不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此话题");
        }
        
        topicRepository.delete(existing);
    }

    @Transactional
    public Comment addComment(Long topicId, String content, User user) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("话题不存在"));
        
        Comment comment = new Comment();
        comment.setTopic(topic);
        comment.setUser(user);
        comment.setContent(content);
        
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此评论");
        }
        
        commentRepository.delete(comment);
    }

    @Transactional
    public boolean toggleLike(Long topicId, User user) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("话题不存在"));
        
        Optional<Like> existingLike = likeRepository.findByUserAndTopic(user, topic);
        
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false;
        } else {
            Like like = new Like();
            like.setTopic(topic);
            like.setUser(user);
            likeRepository.save(like);
            return true;
        }
    }

    public boolean isLikedByUser(Long topicId, User user) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("话题不存在"));
        return likeRepository.existsByUserAndTopic(user, topic);
    }

    public Long getLikeCount(Long topicId) {
        return topicRepository.countLikesByTopicId(topicId);
    }

    public Long getCommentCount(Long topicId) {
        return topicRepository.countCommentsByTopicId(topicId);
    }
}
