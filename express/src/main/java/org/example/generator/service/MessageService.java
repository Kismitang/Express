package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.Message;

/**
* @author 18959
* @description 针对表【message】的数据库操作Service
* @createDate 2025-04-25 16:36:11
*/
public interface MessageService extends IService<Message> {
    // 根据用户电话计算未读消息数量
    int countUnreadMessages(String phone);
}
