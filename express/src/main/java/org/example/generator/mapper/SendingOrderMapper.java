package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.example.generator.entity.SendingOrder;

/**
* @author 18959
* @description 针对表【sending_order】的数据库操作Mapper
* @createDate 2025-03-16 14:29:11
* @Entity generator.entity.SendingOrder
*/
@Mapper
public interface SendingOrderMapper extends BaseMapper<SendingOrder> {
    @Select("SELECT COUNT(*) FROM sending_order WHERE order_number = #{orderNumber}")
    int countByOrderNumber(String orderNumber);
}




