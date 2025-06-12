package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.SendingOrder;

/**
* @author 18959
* @description 针对表【sending_order】的数据库操作Service
* @createDate 2025-03-16 14:29:11
*/
public interface SendingOrderService extends IService<SendingOrder> {
    boolean existsByOrderNumber(String orderNumber);
    long countUnprocessedOrders();
}
