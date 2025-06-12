package org.example.generator.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.example.generator.entity.Shelf;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【shelf】的数据库操作Mapper
* @createDate 2025-02-26 16:29:56
* @Entity generator.entity.Shelf
*/
@Mapper
public interface ShelfMapper extends BaseMapper<Shelf> {
    @Select("SELECT s.shelf_id AS shelfId, COUNT(e.express_id) AS expressCount " +
            "FROM shelf s " +
            "LEFT JOIN express e ON s.shelf_id = e.shelf_id " +
            "GROUP BY s.shelf_id")
    List<Map<String, Object>> countExpressByShelf();
}




