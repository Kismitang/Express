package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.example.generator.entity.Message;

/**
* @author 18959
* @description 针对表【message】的数据库操作Mapper
* @createDate 2025-04-25 16:36:11
* @Entity generator.entity.Message
*/
@Mapper
public interface MessageMapper extends BaseMapper<Message> {

}




