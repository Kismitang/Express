package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.Shelf;
import org.example.generator.entity.User;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【shelf】的数据库操作Service
* @createDate 2025-02-26 16:29:56
*/
public interface ShelfService extends IService<Shelf> {
    List<Shelf> shelfStatus(@RequestBody Shelf shelf);

    List<Shelf> listCanUseShelf();
    void updateShelfStock();

}
