package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.example.generator.entity.Admin;
import org.example.generator.entity.Shelf;
import org.example.generator.mapper.AdminMapper;
import org.example.generator.mapper.ShelfMapper;
import org.example.generator.service.ShelfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【shelf】的数据库操作Service实现
* @createDate 2025-02-26 16:29:56
*/
@Service
public class ShelfServiceImpl extends ServiceImpl<ShelfMapper, Shelf>
    implements ShelfService {
    @Autowired
    AdminMapper adminMapper;

    @Resource
    private SimpMessagingTemplate simpMessagingTemplate;
    // 查询-状态
    public List<Shelf> shelfStatus(@RequestBody Shelf shelf){
        System.out.println(shelf.getStatus());
        LambdaQueryWrapper<Shelf> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Shelf::getStatus,shelf.getStatus());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    @Override
    public List<Shelf> listCanUseShelf(){
        LambdaQueryWrapper<Shelf> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Shelf::getStatus,0,1);
        return this.list(queryWrapper);
    }

    /**
     * 统计每个货架中快递的数量
     */
    @Transactional
    public void updateShelfStock() {
        List<Map<String, Object>> shelfExpressCount = baseMapper.countExpressByShelf();
        // 仅获取当前有变化的货架（示例逻辑，需根据实际场景调整）
//        List<Map<String, Object>> updatedShelves = baseMapper.findRecentlyUpdatedShelves();
        for (Map<String, Object> entry : shelfExpressCount) {
            // 从 Map 中获取 shelfId 和 expressCount
            Object shelfIdObj = entry.get("shelfId");
            Object expressCountObj = entry.get("expressCount");

            if (shelfIdObj instanceof Number && expressCountObj instanceof Number) {
                Integer shelfId = ((Number) shelfIdObj).intValue();
                Integer expressCount = ((Number) expressCountObj).intValue();

                // 获取当前货架的状态
                Shelf currentShelf = getById(shelfId);
                if (currentShelf == null) {
                    continue; // 跳过不存在的货架
                }
                // 如果当前状态是维修中或损坏，跳过更新
                if (currentShelf.getStatus() == 3 || currentShelf.getStatus() == 4 ) {
                    continue;
                }

                // 根据是否有快递绑定到货架，更新货架状态
                if(expressCount > 0){
                    if(expressCount == currentShelf.getCapacity()){ // 当前快递的数量与货架可存快递数量相同,状态为已满
                        System.out.println("货架此时已经存满");
                        currentShelf.setStatus(2);
                    }else {
                        currentShelf.setStatus(0);
                    }
                }else {
                    currentShelf.setStatus(1);
                }
                currentShelf.setCurrentStock(expressCount);
                updateById(currentShelf);

            }
        }
    }

}




