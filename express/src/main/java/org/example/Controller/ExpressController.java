package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.generator.entity.Express;
import org.example.generator.entity.Notice;
import org.example.generator.entity.Shelf;
import org.example.generator.mapper.ExpressMapper;
import org.example.generator.service.ExpressService;
import org.example.generator.service.MessageService;
import org.example.generator.service.ShelfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import javax.swing.plaf.synth.SynthOptionPaneUI;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/express")
public class ExpressController {
    @Autowired
    private ExpressService expressService;
    @Autowired
    private ExpressMapper expressMapper;
    @Autowired
    private ShelfService shelfService;

    // 1.获取所有快递信息
    @GetMapping("/list")
    public List<Express>list(){
        return expressService.list();
    }
    // 自动生成【快递单号】trackingNumber的方法
    private String generateTrackingNumber() {
        String trackingNumber;
        boolean isUnique;
        do {
            // 使用时间戳和随机数生成一个唯一的trackingNumber
            long timestamp = System.currentTimeMillis();
            int random = (int) (Math.random() * 900000) + 100000; // 生成一个6位随机数
            trackingNumber = timestamp + String.valueOf(random);

            // 确保长度在15至19位之间
            if (trackingNumber.length() < 15) {
                trackingNumber = trackingNumber + "000000000000000".substring(trackingNumber.length());
            } else if (trackingNumber.length() > 19) {
                trackingNumber = trackingNumber.substring(0, 19);
            }

            // 检查数据库中是否存在相同的trackingNumber
            isUnique = !expressService.existsByTrackingNumber(trackingNumber);
        } while (!isUnique);

        return trackingNumber;
    }
    // 新增快递
    @PostMapping("/add")
    public Map<String, Object> addExpress(@RequestBody Express express) {
        // 自动生成trackingNumber
        String trackingNumber = generateTrackingNumber();
        express.setTrackingNumber(trackingNumber);

        boolean isAdd = expressService.save(express);
        Map<String, Object> response = new HashMap<>();
        if(isAdd){
            Express express1 = expressService.getById(express.getExpressId());
            response.put("result",isAdd);
            response.put("data",express1);
            response.put("message","快递创建成功");
        }else {
            response.put("message","快递创建失败");
        }
        return response;
    }
    // 3.修改快递信息
    @PostMapping("/update")
    public boolean updateExpress(@RequestBody Express express){
        express.setUpdatedAt(new Date());
        // 处理快递状态变化时的逻辑
        // 当快递状态为待取件/积压的时候必须要输入货架和取件码
        if (express.getStatus() == 6 || express.getStatus() == 7){
            // 首次 如果 entryAt 为空，则设置入库时间
            if (express.getEntryAt() == null) {
                express.setEntryAt(new Date());
            }
            if (express.getShelfId() == null || express.getLabelCode() == null){
                throw new RuntimeException("快递待取件时必须输入货架和取件码信息");
            }
        }else if(express.getStatus() <= 5 || express.getStatus() == 9){
                express.setShelfId(null);
                express.setLabelCode(null);
                System.out.println("Before data: " + express.getLabelCode() + " and " + express.getShelfId());
        }

        // 更新快递信息
        boolean isUpdated = expressService.updateById(express);

        // 快递更新后触发货架状态更新
        if(isUpdated){
            shelfService.updateShelfStock(); // 调用货架服务更新库存并推送消息
        }
        // 在更新数据库之后输出值
        System.out.println("After update: " + express.getLabelCode() + " and " + express.getShelfId());
        return isUpdated;
    }
    // 修改快递的状态任务
    @PostMapping("/update_task")
    public boolean updateExpressTask(@RequestBody Express express) {
        // 根据 expressId 查询数据库获取当前快递信息
        Express currentExpress = expressService.getById(express.getExpressId());
        if (currentExpress != null) {
            // 如果当前快递有 entryAt 和 shelfId，则将其设置到要更新的 express 对象中
            express.setEntryAt(currentExpress.getEntryAt());
            express.setShelfId(currentExpress.getShelfId());
        }
        return expressService.updateById(express);
    }
    // 4.删除快递信息(逻辑删除)//将快递的状态修改为8(删除)
    @GetMapping("/deleteL")
    public boolean deleteExpress_L(Integer expressId){
        return expressService.logicDeleteExpress(expressId);
    }
    // 5.删除快递(物理删除)因为是在回收箱中进行修改所以此时status=8继续进行删除操作则返回
    @GetMapping("/deleteP")
    public boolean deleteExpress_P(Integer expressId){
        return expressService.removeById(expressId);
    }
    // 6.查询-快递单号(模糊)
    @PostMapping("/searchByExpressNum")
    public List<Express> searchExpressNum(@RequestBody Express express){
        return expressService.listByExpressNum(express);
    }
    // 7.查询-快递状态
    @PostMapping("/searchByStatus")
    public List<Express> searchByStatus(@RequestBody Express express){
        return expressService.listByExpressStatus(express);
    }
    // 8.查询-电话号码(模糊)
    @PostMapping("/searchByPhone")
    public List<Express>searchByPhone(@RequestBody Express express){
        return expressService.listByExpressPhone(express);
    }
    // 分页查询
    @PostMapping("/listPage")
    public Map<String, Object> listPage(@RequestBody HashMap map) {

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());
        // 获取是否为回收箱
        long delete = Long.parseLong(map.get("delete").toString());



        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<Express> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Express> lambdaQueryWrapper = new LambdaQueryWrapper<>();

        if(delete == 0){    //全部快递除了已经被(逻辑)删除的
//            System.out.println("delete:" + delete);
            lambdaQueryWrapper.ne(Express::getStatus, 9);
        }else {
//            System.out.println("delete:" + delete);
            lambdaQueryWrapper.eq(Express::getStatus, 9);
        }

        if ("trackingNumber".equals(field)) {
            lambdaQueryWrapper.like(Express::getTrackingNumber, value); // 按标题模糊查询
        } else if ("receiverPhone".equals(field)) {
            lambdaQueryWrapper.like(Express::getReceiverPhone, value); // 按货架备注查询
        }

        // 状态、更新时间降序排列
        lambdaQueryWrapper.orderByDesc(Express::getStatus)
                          .orderByDesc(Express::getUpdatedAt);

        lambdaQueryWrapper.like(Express::getStatus,map.get("status"));

        IPage<Express> result = expressService.page(page, lambdaQueryWrapper);
        // 计算每个 Express 对象的 积压日期(overstockDay)
//        List<Express> records = result.getRecords();
//        for (Express express : records) {
//            calculateOverstockDay(express);
//            // 将修改后的 Express 对象保存到数据库
//            expressService.updateById(express);
//        }

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }

    /**
     * 计算积压天数的方法
     * @param express
     */
    private void calculateOverstockDay(Express express) {
        // 获取当前时间和入库时间
        Date currentTime = new Date(); // 当前时间
        Date entryAt = express.getEntryAt(); // 入库时间

        if (entryAt != null) {
//            System.out.println(entryAt);
            // 计算时间差（毫秒）
            long timeDiff = currentTime.getTime() - entryAt.getTime();
            // 转换为天数
            long overstockDays = timeDiff / (24 * 60 * 60 * 1000); // 一天的毫秒数
//            System.out.println("积压时间:" + overstockDays);
            // 如果时间差不足7天，overstockDay 为 0
            if (overstockDays < 7) {
                express.setOverstockDay(0);
            } else {
                // 设置状态为积压 status = 7
                if(express.getStatus()!=9){
                    express.setStatus(7);
                    // 设置此时自动存放到积压货架中
                    express.setShelfId(4);
                }
                express.setOverstockDay((int) overstockDays - 7);
            }
//            System.out.println("转换后的积压时间:" + express.getOverstockDay());
        } else {
            // 如果入库时间为空，overstockDay 设置为 0
            express.setOverstockDay(0);
        }
    }
    // 恢复
    // 恢复快递状态为已签收
    @PostMapping("/recover")
    public boolean recoverExpress(@RequestBody Express express) {
        return expressService.updateById(express);
    }

    /**
     * 查收:根据电话号查询所有有关的快递
     */
    @PostMapping("/expressByPhone")
    public Map<String, Object> getExpressByReceiverPhone(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        String receiverPhone = requestData.get("receiverPhone");
        String trackingNumber = requestData.get("trackingNumber");
        String expressDesribe = requestData.get("expressDesribe");

        try {
            // 使用 LambdaQueryWrapper 构建查询条件
            LambdaQueryWrapper<Express> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Express::getReceiverPhone, receiverPhone); // 根据电话号码查询

            if (trackingNumber != null && !trackingNumber.isEmpty()) {
                // 如果提供了快递单号，则进行模糊查询
                queryWrapper.like(Express::getTrackingNumber, trackingNumber);
            }

            if (expressDesribe != null && !expressDesribe.isEmpty()) {
                // 如果提供了快递信息，则进行模糊查询
                queryWrapper.like(Express::getExpressDesribe, expressDesribe);
            }

            List<Express> expressList = expressService.list(queryWrapper);

            response.put("success", true);
            response.put("expressList", expressList);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "查询失败: " + e.getMessage());
        }
        return response;
    }
    /**
     *  寄退:根据电话号码查询所有寄出的快递
     */
    @PostMapping("/sendingOrderByPhone")
    public Map<String, Object> getExpressBySenderPhone(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        String senderPhone = requestData.get("senderPhone");
        String trackingNumber = requestData.get("trackingNumber");

        try {
            // 使用 LambdaQueryWrapper 构建查询条件
            LambdaQueryWrapper<Express> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Express::getSenderPhone, senderPhone); // 根据电话号码查询

            if (trackingNumber != null && !trackingNumber.isEmpty()) {
                // 如果提供了快递单号，则进行模糊查询
                queryWrapper.like(Express::getTrackingNumber, trackingNumber);
            }

            List<Express> expressList = expressService.list(queryWrapper);

            response.put("success", true);
            response.put("expressList", expressList);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("fail", false);
            response.put("message", "查询失败: " + e.getMessage());
        }
        return response;
    }

    /**
     * 统计不同快递状态下快递数量
     */
    @GetMapping("/countByStatus")
    public Map<Integer,Long> countExpressByStatus(){
        System.out.println("计算");
        return expressService.countExpressByStatus();
    }

    // 根据取件码查询快递并修改状态为已签收
    @PostMapping("/signForExpress")
    public Map<String, Object> signForExpress(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        String labelCode = requestData.get("labelCode");
        System.out.println("取件码: " + labelCode);
        try {
            // 使用 LambdaQueryWrapper 构建查询条件
            LambdaQueryWrapper<Express> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Express::getLabelCode, labelCode); // 根据取件码查询

            Express express = expressService.getOne(queryWrapper);

            if (express != null) {
                if(express.getStatus() == 0) { // 如果快递已经签收
                    System.out.println("快递已经签收");
                    expressService.updateById(express);
                    response.put("code", 300);
                    response.put("data", "快递已经签收");
                } else {
                    System.out.println("快递尚未签收");
                    // 修改快递状态为已签收
                    express.setStatus(0);
                    express.setUpdatedAt(new Date());
                    express.setLabelCode(null);
                    boolean isUpdated = expressService.updateById(express);

                    if (isUpdated) {
                        response.put("code", 200);
                        response.put("message", "快递签收成功");
                        response.put("express", express);
                    } else {
                        response.put("code", 400);
                        response.put("message", "签收失败");
                    }
                }
                System.out.println("更新时间: " + express.getUpdatedAt());
            } else {
                response.put("success", false);
                response.put("message", "未找到匹配的快递");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "操作失败: " + e.getMessage());
        }
        return response;
    }
}
