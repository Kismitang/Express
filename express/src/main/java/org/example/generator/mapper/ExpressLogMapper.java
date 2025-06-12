package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.example.generator.entity.ExpressLog;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【express_log】的数据库操作Mapper
* @createDate 2025-03-14 12:32:36
* @Entity generator.entity.ExpressLog
*/
@Mapper
public interface ExpressLogMapper extends BaseMapper<ExpressLog> {

}




