package org.example.generator.service;


import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.DailySignStatistics;
import org.example.generator.entity.Express;
import org.example.generator.mapper.ExpressMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【express】的数据库操作Service
* @createDate 2025-02-26 17:57:36
*/
public interface ExpressService extends IService<Express> {
    List<Express> listByExpressNum(@RequestBody Express express);
    boolean logicDeleteExpress(Integer expressId);
    List<Express> listByExpressStatus(@RequestBody Express express);
    List<Express> listByExpressPhone(@RequestBody Express express);
    boolean existsByTrackingNumber(String trackingNumber);

    /**
     * 根据电话号查询所有快递
     */
    List<Express> findByReceiverPhone(String receiverPhone);

    /**
     * 根据电话号码查询所有寄出快递信息
     * @param senderPhone
     * @return
     */
    List<Express> findBySenderPhone(String senderPhone);
    Map<Integer, Long> countExpressByStatus();

    void updateOverdueExpress();

}
