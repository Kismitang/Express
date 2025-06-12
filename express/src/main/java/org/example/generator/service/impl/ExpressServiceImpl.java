package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.ibatis.javassist.expr.Expr;
import org.example.generator.entity.Admin;
import org.example.generator.entity.Message;
import org.example.generator.mapper.ExpressMapper;
import org.example.generator.entity.Express;
import org.example.generator.service.ExpressService;
import org.example.generator.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
* @author 18959
* @description 针对表【express】的数据库操作Service实现
* @createDate 2025-02-26 17:57:36
*/
@Service
public class ExpressServiceImpl extends ServiceImpl<ExpressMapper, Express>
    implements ExpressService {
    @Autowired
    private ExpressMapper expressMapper;
    @Autowired
    private MessageService messageService;
    // 快递单号模糊查询
    @Override
    public List<Express> listByExpressNum(@RequestBody Express express){
        LambdaQueryWrapper<Express> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(Express::getTrackingNumber,express.getTrackingNumber());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    // 逻辑删除快递
    @Override
    public boolean logicDeleteExpress(Integer expressId){
        //构建更新条件
        LambdaUpdateWrapper<Express> updateWrapper = new LambdaUpdateWrapper<>();
//        updateWrapper.eq(Express::getExpressId,express.getExpressId()).set(Express::getStatus,8);
        updateWrapper.eq(Express::getExpressId, expressId)
                .set(Express::getStatus, 9); // 设置 status 为 9，表示删除
        return this.update(updateWrapper);
    }
    // 根据状态查询
    @Override
    public List<Express> listByExpressStatus(@RequestBody Express express){
        System.out.println(express.getStatus());
        LambdaQueryWrapper<Express> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Express::getStatus,express.getStatus());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    // 根据电话号码查询
    @Override
    public List<Express> listByExpressPhone(@RequestBody Express express){
        LambdaQueryWrapper<Express> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(Express::getReceiverPhone,express.getReceiverPhone());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    @Override
    public boolean existsByTrackingNumber(String trackingNumber) {
        return expressMapper.countByTrackingNumber(trackingNumber) > 0;
    }
    @Override
    public List<Express> findByReceiverPhone(String receiverPhone) {
        return getBaseMapper().findByReceiverPhone(receiverPhone);
    }

    @Override
    public List<Express> findBySenderPhone(String senderPhone) {
        return getBaseMapper().findBySenderPhone(senderPhone);
    }

    @Override
    public Map<Integer, Long> countExpressByStatus() {
        List<Map<String, Object>> listMaps = this.baseMapper.countExpressByStatus();

        return listMaps.stream()
                .collect(Collectors.toMap(
                        map -> (Integer) map.get("status"),
                        map -> (Long) map.get("count")
                ));
    }

    @Override
    public void updateOverdueExpress() {
        // 获取当前时间
        Date now = new Date();

        // 查询所有状态为 6（未超时）和 7（已超时）
        LambdaQueryWrapper<Express> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Express::getStatus, 6,7);

        List<Express> expressList = list(queryWrapper);

        for (Express express : expressList) {
            // 计算当前时间与入库时间的差值（天数）
            long diff = now.getTime() - express.getEntryAt().getTime();
            long days = diff / (1000 * 60 * 60 * 24);
//            long days = diff / (1000 * 60);


            if (express.getStatus() == 6 && days > 7) {
                // 创建更新条件
                LambdaUpdateWrapper<Express> updateWrapper = new LambdaUpdateWrapper<>();
                updateWrapper.eq(Express::getExpressId, express.getExpressId());

                // 更新快递状态为 7，设置 overstockDay 为积压天数，更新 updatedAt 为当前时间
                Express updateExpress = new Express();
                updateExpress.setStatus(7);
                updateExpress.setOverstockDay((int) days);
                updateExpress.setUpdatedAt(now);
                updateExpress.setEntryAt(express.getEntryAt()); // 保留原入库时间
                updateExpress.setShelfId(4);
                updateExpress.setLabelCode(express.getLabelCode());

                update(updateExpress, updateWrapper);

                // 获取收件人电话号码
                String receiverPhone = express.getReceiverPhone();

                // 创建消息实体
                Message message = new Message();
                message.setMessageType(0); // 消息类型为 0，表示快递消息
                message.setUserPhone(receiverPhone);
                message.setMessageContent("【超时提醒】您的快递已超时，放置于1号货架中，请尽快处理！快递单号:"+express.getTrackingNumber()+",取件码:【"+express.getLabelCode()+"】");
                message.setCreateTime(now);
                message.setIsRead(0); // 未读状态

                // 保存消息
                messageService.save(message);
            } else if (express.getStatus() == 7) {
                // 如果已经是超时状态，更新超时天数和 updatedAt
                LambdaUpdateWrapper<Express> updateWrapper = new LambdaUpdateWrapper<>();
                updateWrapper.eq(Express::getExpressId, express.getExpressId());

                Express updateExpress = new Express();
                updateExpress.setOverstockDay((int) days);
                updateExpress.setUpdatedAt(now);
                updateExpress.setEntryAt(express.getEntryAt()); // 保留原入库时间
                updateExpress.setShelfId(4);
                updateExpress.setLabelCode(express.getLabelCode());

                update(updateExpress, updateWrapper);
            }
        }
    }
}




