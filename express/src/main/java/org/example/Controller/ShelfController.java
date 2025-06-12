package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.generator.entity.Admin;
import org.example.generator.entity.Shelf;
import org.example.generator.mapper.ShelfMapper;
import org.example.generator.service.ShelfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shelf")
public class ShelfController {
    @Autowired
    private ShelfService shelfService;
    // 1.获取所有货架信息
    @GetMapping("/list")
    public List<Shelf>list(){
        return shelfService.list();
    }
    // 2.新增货架
//    @PostMapping("/add")
//    public boolean addShelf(@RequestBody Shelf shelf){
//        return shelfService.save(shelf);
//    }
    @PostMapping("/add")
    public Map<String, Object> addSelf(@RequestBody Shelf shelf) {
        boolean isAdd = shelfService.save(shelf);
        Map<String, Object> response = new HashMap<>();
        if(isAdd){
            Shelf shelf1 = shelfService.getById(shelf.getShelfId());
            response.put("result",isAdd);
            response.put("data",shelf1);
            response.put("message","货架创建成功");
        }else {
            response.put("message","货架创建失败");
        }
        return response;
    }
    // 3.删除货架
    @GetMapping("/delete")
    public boolean deleteShelf(@RequestParam("shelfId") Integer shelfId){
        return shelfService.removeById(shelfId);
    }
    // 4.修改货架信息
    @PostMapping("/update")
    public boolean updateShelf(@RequestBody Shelf shelf){
        return shelfService.updateById(shelf);
    }
    // 5.查询-状态
    @PostMapping("/searchByStatus")
    public List<Shelf> listStatus(@RequestBody Shelf shelf){
        return shelfService.shelfStatus(shelf);
    }
    // 6.分页
    @PostMapping("/listPage")
    public Map<String, Object> listPage(@RequestBody HashMap map) {
        // 更新货架的当前快递数量
        shelfService.updateShelfStock();

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<Shelf> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Shelf> lambdaQueryWrapper = new LambdaQueryWrapper<>();


        if ("shelfName".equals(field)) {
            lambdaQueryWrapper.like(Shelf::getShelfName, value); // 按货架名查询
        } else if ("shelfRemark".equals(field)) {
            lambdaQueryWrapper.like(Shelf::getShelfRemark, value); // 按货架备注查询
        }

        lambdaQueryWrapper.like(Shelf::getStatus,map.get("status"));
//        }
        IPage<Shelf> result = shelfService.page(page, lambdaQueryWrapper);

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }

    @PostMapping("/listCanUseShelf")
    public Map<String,Object> listCanUseShelf(){
        try {
//            System.out.println("Find can use shelves");
            List<Shelf> canUseShelves = shelfService.listCanUseShelf();
            // 构造返回结果
            Map<String, Object> response = new HashMap<>();
            response.put("total",canUseShelves.size());
            response.put("data",canUseShelves);
            return response;
        }catch (Exception e){
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("message","获取可用货架失败");
            return response;
        }
    }
}
