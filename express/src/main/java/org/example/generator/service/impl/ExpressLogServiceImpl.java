package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import org.example.generator.entity.Express;
import org.example.generator.entity.ExpressLog;
import org.example.generator.mapper.AdminMapper;
import org.example.generator.mapper.ExpressLogMapper;
import org.example.generator.service.ExpressLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【express_log】的数据库操作Service实现
* @createDate 2025-03-14 12:32:36
*/
@Service
public class ExpressLogServiceImpl extends ServiceImpl<ExpressLogMapper, ExpressLog>
    implements ExpressLogService {

}




