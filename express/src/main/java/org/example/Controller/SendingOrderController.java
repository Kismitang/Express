package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.generator.entity.SendingOrder;
import org.example.generator.service.SendingOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/send")
public class SendingOrderController {
    @Autowired
    private SendingOrderService sendingOrderService;
    // 自动生成【快递单号】trackingNumber的方法
    private String generateOrderNumber() {
        String orderNumber;
        boolean isUnique;
        do {
            // 使用时间戳和随机数生成一个唯一的trackingNumber
            long timestamp = System.currentTimeMillis();
            int random = (int) (Math.random() * 900000) + 100000; // 生成一个6位随机数
            orderNumber = timestamp + String.valueOf(random);

            // 确保长度在15至19位之间
            if (orderNumber.length() < 15) {
                orderNumber = orderNumber + "000000000000000".substring(orderNumber.length());
            } else if (orderNumber.length() > 19) {
                orderNumber = orderNumber.substring(0, 19);
            }

            // 检查数据库中是否存在相同的trackingNumber
            isUnique = !sendingOrderService.existsByOrderNumber(orderNumber);
        } while (!isUnique);

        return orderNumber;
    }
    @PostMapping("/add")
    public Map<String, Object> addSend(@RequestBody SendingOrder sendingOrder){
        // 自动生成trackingNumber
        String orderNumber = generateOrderNumber();
        sendingOrder.setOrderNumber(orderNumber);

        sendingOrder.setCreatedAt(new Date());
        boolean isAdd = sendingOrderService.save(sendingOrder);
        Map<String, Object> response = new HashMap<>();
        if(isAdd){
            SendingOrder sendingOrder1 = sendingOrderService.getById(sendingOrder.getOrderId());
            response.put("code",200);
            response.put("data",sendingOrder1);
            response.put("message","寄件单成功生成");
        }else {
            response.put("code",400);
            response.put("message","寄件单生成失败");
        }
        return response;
    }

    // 分页查询
    @PostMapping("/listPage")
    public Map<String, Object>listPage(@RequestBody HashMap map){

        // 获取页码和每页的大小(将获得的值转为String类型再转为Long类型)
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";
        // 初始化分页对象
        Page<SendingOrder> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<SendingOrder> lambdaQueryWrapper = new LambdaQueryWrapper<>();

        if("senderPhone".equals(field)){
            lambdaQueryWrapper.like(SendingOrder::getSenderPhone, value);
        }else if("orderNumber".equals(field)){
            lambdaQueryWrapper.like(SendingOrder::getOrderNumber,value);
        }

        // 状态升序,更新时间降序
        lambdaQueryWrapper.orderByAsc(SendingOrder::getPaymentStatus)
                        .orderByDesc(SendingOrder::getUpdateAt);

        lambdaQueryWrapper.like(SendingOrder::getPaymentStatus,map.get("paymentStatus"));
        IPage<SendingOrder> result = sendingOrderService.page(page, lambdaQueryWrapper);

        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }

    // 更新寄件单
    @PostMapping("/update")
    public boolean updateSenderOrder(@RequestBody SendingOrder sendingOrder){
        // 当管理员输入寄件费用之后支付状态为待支付
        if(sendingOrder.getCost() != null){
            sendingOrder.setPaymentStatus(1);
        }
        System.out.println("寄件单更新成功");
        return sendingOrderService.updateById(sendingOrder);
    }

    @GetMapping("/delete")
    public boolean delete(Integer orderId){
//        SendingOrder sendingOrder = sendingOrderService.getById(orderId);
//        if(sendingOrder.getPaymentStatus() == 0){
//            return false;
//        }
        System.out.println("删除订单号:"+orderId);
        return sendingOrderService.removeById(orderId);
    }

    /**
     * 统计状态为0的寄件单数量
     * @return 统计结果
     */
    @GetMapping("/countUnprocessed")
    public Map<String, Object> countUnprocessedOrders() {
        long count = sendingOrderService.countUnprocessedOrders();
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", count);
        response.put("message", "统计成功");
        return response;
    }
    /**
     * 根据用户电话号码(寄件人)查询所有寄件快递信息
     */
    @PostMapping("/sendOrderByPhone")
    public Map<String, Object> getOrderByPhone(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        String senderPhone = requestData.get("senderPhone");
        try {
            LambdaQueryWrapper<SendingOrder> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(SendingOrder::getSenderPhone, senderPhone);//根据电话号码查询
            List<SendingOrder> sendOrderList = sendingOrderService.list(queryWrapper);
            response.put("success",true);
            response.put("sendOrderList",sendOrderList);
        }catch (Exception e) {
            response.put("fail",false);
            response.put("message","查询失败:"+e.getMessage());
        }
        return response;
    }
}
