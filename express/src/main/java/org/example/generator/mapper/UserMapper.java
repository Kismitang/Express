package org.example.generator.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.example.generator.entity.User;

/**
* @author 18959
* @description 针对表【user】的数据库操作Mapper
* @createDate 2025-02-27 09:31:53
* @Entity generator.entity.User
*/
public interface UserMapper extends BaseMapper<User> {
    /**
     * 更新用户头像
     * @param adminId
     * @param avatarUrl
     * @return
     */
    @Update("UPDATE user SET avatar_url = #{avatarUrl} WHERE user_id = #{userId}")
    int updateAvatar(@Param("userId") Integer userId, @Param("avatarUrl") String avatarUrl);
}




