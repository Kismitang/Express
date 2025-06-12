package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import org.example.generator.entity.SendingOrder;
import org.example.generator.mapper.SendingOrderMapper;
import org.example.generator.service.SendingOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
* @author 18959
* @description 针对表【sending_order】的数据库操作Service实现
* @createDate 2025-03-16 14:29:11
*/
@Service
public class SendingOrderServiceImpl extends ServiceImpl<SendingOrderMapper, SendingOrder>
    implements SendingOrderService {
    @Autowired
    SendingOrderMapper sendingOrderMapper;
    @Override
    public boolean existsByOrderNumber(String orderNumber) {
        return sendingOrderMapper.countByOrderNumber(orderNumber) > 0;
    }

    @Override
    public long countUnprocessedOrders() {
        LambdaQueryWrapper<SendingOrder> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SendingOrder::getPaymentStatus, 0);
        return this.count(queryWrapper);
    }
}




