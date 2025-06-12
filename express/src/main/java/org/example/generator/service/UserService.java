package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.User;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【user】的数据库操作Service
* @createDate 2025-02-27 09:31:53
*/
public interface UserService extends IService<User> {
    List<User> listByUserName(@RequestBody User user);
    List<User> listByPhone(@RequestBody User user);
    List<User> listByStatus(@RequestBody User user);
    Map<String, Object> addUser(User user);
    Map<String, Object> dedutBalance(String phone, Double cost);
    Map<String, Object> addBalance(String phone, Double amount);
}
