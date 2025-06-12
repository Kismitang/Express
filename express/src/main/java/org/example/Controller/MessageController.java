package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.example.generator.entity.Message;
import org.example.generator.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("message")
public class MessageController {
    @Autowired
    private MessageService messageService;

    // 1.新增消息
    @PostMapping("/add")
    public Map<String, Object> addMessage(@RequestBody Message message) {
        boolean isAdd = messageService.save(message);
        Map<String, Object> response = new HashMap<>();
        if(isAdd){
            Message message1 = messageService.getById(message.getMessageId());
            response.put("code", 200);
            response.put("data", message1);
        }else {
            response.put("code", 400);
            response.put("message", "消息生成失败");
        }
        return response;
    }

    // 2.根据用户电话和类型获取全部信息
    @PostMapping("/messageByPhoneAndType")
    public Map<String, Object> getMessageByPhoneAndType(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String phone = request.get("phone");
        String type = request.get("type");
//        System.out.println("phone: " + phone + ", type: " + type);
        try {
            LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Message::getUserPhone, phone);
            queryWrapper.eq(Message::getMessageType, type);
            List<Message> messages = messageService.list(queryWrapper);
            response.put("code", 200);
            response.put("data", messages);
        }catch (Exception e) {
            response.put("code", 400);
            response.put("data", "获取消息失败," + e.getMessage());
        }
        return response;
    }

    // 根据用户电话获取最新四种类型的全部信息
    @PostMapping("/messageByPhone")
    public Map<String, Object> getMessageByPhone(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String phone = request.get("phone");

        try {
            // 定义一个LambdaQueryWrapper进行查询
            List<Message> messages = messageService.list(
                    Wrappers.<Message>lambdaQuery()
                            .eq(Message::getUserPhone, phone)
                            .in(Message::getMessageType, 0, 1, 2, 3)
            );

            // 按消息类型分组，并获取每组的最新一条消息
            Map<Integer, Message> latestMessages = messages.stream()
                    .collect(Collectors.toMap(
                            Message::getMessageType, // 按消息类型分组
                            message -> message, // 存储消息对象
                            (existing, replacement) -> { // 解决重复key的问题，保留最新的消息
                                return existing.getCreateTime().after(replacement.getCreateTime()) ? existing : replacement;
                            }
                    ));

            response.put("code", 200);
            response.put("data", latestMessages.values());
        } catch (Exception e) {
            response.put("code", 400);
            response.put("data", "获取消息失败," + e.getMessage());
        }

        return response;
    }

    // 3.根据用户电话计算未读消息数量
    @PostMapping("/count")
    public Map<String, Object> getUnreadMessageCount(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String phone = request.get("phone");

        try {
            // 查询未读消息的数量 (isRead = 0)
            int unreadCount = messageService.countUnreadMessages(phone);

            response.put("code", 200);
            response.put("data", unreadCount);
        } catch (Exception e) {
            response.put("code", 400);
            response.put("message", "获取未读消息数量失败: " + e.getMessage());
        }

        return response;
    }

    // 4.更新消息
    @PostMapping("/update")
    public boolean updateMessage(@RequestBody Message message) {
        return messageService.updateById(message);
    }

    // 5.根据消息类型更新该类型下的全部消息为已读
    @PostMapping("/updateByType")
    public Map<String, Object> updateMessagesByType(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 参数校验
            if (!request.containsKey("messageType") || !request.containsKey("userPhone")) {
                response.put("code", 400);
                response.put("message", "缺少必要参数: messageType 或 userPhone");
                return response;
            }

            // 类型转换校验
            Integer messageType;
            String userPhone;
            try {
                messageType = (Integer) request.get("messageType");
                userPhone = (String) request.get("userPhone");
            } catch (ClassCastException e) {
                response.put("code", 400);
                response.put("message", "参数类型错误");
                return response;
            }

            // 非空校验
            if (messageType == null || userPhone == null || userPhone.trim().isEmpty()) {
                response.put("code", 400);
                response.put("message", "参数不能为空");
                return response;
            }

            // 构建更新条件：根据类型和用户电话，更新所有消息为已读
            LambdaUpdateWrapper<Message> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Message::getMessageType, messageType)
                    .eq(Message::getUserPhone, userPhone)
                    .set(Message::getIsRead, 1); // 1 表示已读

            // 执行更新操作
            boolean isUpdated = messageService.update(updateWrapper);

            // 响应结果处理
            if (isUpdated) {
                response.put("code", 200);
                response.put("message", "消息已全部标记为已读");
            } else {
                response.put("code", 200); // 或根据需求返回204
                response.put("message", "未找到符合条件的消息");
            }

        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "服务器内部错误: " + e.getMessage());
            e.printStackTrace(); // 实际项目中应使用日志记录
        }
        return response;
    }
}
