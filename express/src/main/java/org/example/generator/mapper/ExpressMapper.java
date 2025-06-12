package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.example.generator.entity.Express;
import org.example.generator.entity.Shelf;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【express】的数据库操作Mapper
* @createDate 2025-02-26 17:57:36
* @Entity generator.entity.Express
*/
@Mapper
public interface ExpressMapper extends BaseMapper<Express> {
    /**
     * 搜索是否有相同的快递单
     * @param trackingNumber
     * @return
     */
    @Select("SELECT COUNT(*) FROM express WHERE tracking_number = #{trackingNumber}")
    int countByTrackingNumber(String trackingNumber);

    /**
     * 根据电话号返回所有有关的快递
     * @param receiverPhone
     * @return
     */
    @Select("SELECT * FROM express WHERE receiver_phone = #{receiverPhone}")
    List<Express> findByReceiverPhone(String receiverPhone);

    /**
     * 根据电话号码返回所有寄出快递的信息
     * @param senderPhone
     * @return
     */
    @Select("SELECT * FROM express WHERE sender_phone = #{senderPhone}")
    List<Express> findBySenderPhone(String senderPhone);

    /**
     * 统计不同状态下快递的数量
     * @return
     */
    @Select("SELECT status, COUNT(*) AS count FROM express GROUP BY status")
    List<Map<String, Object>> countExpressByStatus();
}




