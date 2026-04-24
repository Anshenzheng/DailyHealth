package com.dailyhealth.controller;

import com.dailyhealth.dto.ApiResponse;
import com.dailyhealth.entity.Comment;
import com.dailyhealth.entity.Topic;
import com.dailyhealth.entity.User;
import com.dailyhealth.service.AuthService;
import com.dailyhealth.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    @Autowired
    private TopicService topicService;

    @Autowired
    private AuthService authService;

    @GetMapping("/public/list")
    public ResponseEntity<?> getPublicTopics(@PageableDefault(size = 10) Pageable pageable) {
        Page<Topic> topics = topicService.getAllTopics(pageable);
        
        List<Map<String, Object>> topicList = topics.getContent().stream().map(topic -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", topic.getId());
            map.put("title", topic.getTitle());
            map.put("content", topic.getContent());
            map.put("createdAt", topic.getCreatedAt());
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", topic.getUser().getId());
            userMap.put("username", topic.getUser().getUsername());
            userMap.put("nickname", topic.getUser().getNickname());
            userMap.put("avatar", topic.getUser().getAvatar());
            map.put("user", userMap);
            
            map.put("likeCount", topicService.getLikeCount(topic.getId()));
            map.put("commentCount", topicService.getCommentCount(topic.getId()));
            
            return map;
        }).collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", topicList);
        result.put("totalElements", topics.getTotalElements());
        result.put("totalPages", topics.getTotalPages());
        result.put("currentPage", topics.getNumber());
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicTopicById(@PathVariable Long id) {
        return topicService.getTopicById(id)
                .map(topic -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", topic.getId());
                    result.put("title", topic.getTitle());
                    result.put("content", topic.getContent());
                    result.put("createdAt", topic.getCreatedAt());
                    
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", topic.getUser().getId());
                    userMap.put("username", topic.getUser().getUsername());
                    userMap.put("nickname", topic.getUser().getNickname());
                    userMap.put("avatar", topic.getUser().getAvatar());
                    result.put("user", userMap);
                    
                    result.put("likeCount", topicService.getLikeCount(topic.getId()));
                    result.put("commentCount", topicService.getCommentCount(topic.getId()));
                    
                    List<Map<String, Object>> comments = topic.getComments().stream().map(comment -> {
                        Map<String, Object> commentMap = new HashMap<>();
                        commentMap.put("id", comment.getId());
                        commentMap.put("content", comment.getContent());
                        commentMap.put("createdAt", comment.getCreatedAt());
                        
                        Map<String, Object> commentUserMap = new HashMap<>();
                        commentUserMap.put("id", comment.getUser().getId());
                        commentUserMap.put("username", comment.getUser().getUsername());
                        commentUserMap.put("nickname", comment.getUser().getNickname());
                        commentUserMap.put("avatar", comment.getUser().getAvatar());
                        commentMap.put("user", commentUserMap);
                        
                        return commentMap;
                    }).collect(Collectors.toList());
                    result.put("comments", comments);
                    
                    return ResponseEntity.ok(ApiResponse.success(result));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTopics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<Topic> topics = topicService.getTopicsByUser(user);
        
        List<Map<String, Object>> topicList = topics.stream().map(topic -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", topic.getId());
            map.put("title", topic.getTitle());
            map.put("content", topic.getContent());
            map.put("createdAt", topic.getCreatedAt());
            map.put("likeCount", topicService.getLikeCount(topic.getId()));
            map.put("commentCount", topicService.getCommentCount(topic.getId()));
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(topicList));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Topic topic) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            Topic created = topicService.createTopic(topic, user);
            return ResponseEntity.ok(ApiResponse.success("话题发布成功", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Topic topic) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            Topic updated = topicService.updateTopic(id, topic, user);
            return ResponseEntity.ok(ApiResponse.success("话题更新成功", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            topicService.deleteTopic(id, user);
            return ResponseEntity.ok(ApiResponse.success("话题删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{topicId}/comments")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long topicId,
            @RequestBody Map<String, String> request) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            String content = request.get("content");
            Comment comment = topicService.addComment(topicId, content, user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", comment.getId());
            result.put("content", comment.getContent());
            result.put("createdAt", comment.getCreatedAt());
            
            return ResponseEntity.ok(ApiResponse.success("评论发布成功", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long commentId) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            topicService.deleteComment(commentId, user);
            return ResponseEntity.ok(ApiResponse.success("评论删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{topicId}/like")
    public ResponseEntity<?> toggleLike(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long topicId) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            boolean isLiked = topicService.toggleLike(topicId, user);
            Long likeCount = topicService.getLikeCount(topicId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("isLiked", isLiked);
            result.put("likeCount", likeCount);
            
            return ResponseEntity.ok(ApiResponse.success(isLiked ? "点赞成功" : "取消点赞", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
