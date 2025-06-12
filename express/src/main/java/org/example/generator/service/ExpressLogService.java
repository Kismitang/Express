package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.Express;
import org.example.generator.entity.ExpressLog;
import org.example.generator.mapper.ExpressLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【express_log】的数据库操作Service
* @createDate 2025-03-14 12:32:36
*/
public interface ExpressLogService extends IService<ExpressLog> {

}
