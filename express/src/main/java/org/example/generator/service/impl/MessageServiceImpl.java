package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import org.example.generator.entity.Message;
import org.example.generator.mapper.MessageMapper;
import org.example.generator.service.MessageService;
import org.springframework.stereotype.Service;

/**
* @author 18959
* @description 针对表【message】的数据库操作Service实现
* @createDate 2025-04-25 16:36:11
*/
@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message>
    implements MessageService {
    @Override
    public int countUnreadMessages(String phone) {
        // 创建查询构造器
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Message::getUserPhone, phone);
        queryWrapper.eq(Message::getIsRead, 0); // 0表示未读消息

        // 执行查询并返回数量
        return (int)this.count(queryWrapper);
    }
}




