package com.cnpanoramio.dao;

import org.appfuse.dao.GenericDao;

import com.cnpanoramio.domain.Travel;

public interface TravelDao extends GenericDao<Travel, Long> {
	
	/**
	 * 通过名称获取用户travel
	 * 
	 * @param userId
	 * @param name
	 * @return
	 */
	public Travel getByName(Long userId, String name);
}
