package com.dailyhealth.dto;

public class JwtResponse {

    private String token;
    private String username;
    private String nickname;
    private String email;

    public JwtResponse() {
    }

    public JwtResponse(String token, String username, String nickname, String email) {
        this.token = token;
        this.username = username;
        this.nickname = nickname;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
