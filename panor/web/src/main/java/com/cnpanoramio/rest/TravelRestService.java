package com.cnpanoramio.rest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appfuse.model.User;
import org.appfuse.service.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.cnpanoramio.domain.Photo;
import com.cnpanoramio.json.TravelResponse;
import com.cnpanoramio.service.PhotoManager;
import com.cnpanoramio.service.TravelManager;
import com.cnpanoramio.service.TravelService;
import com.cnpanoramio.utils.TravelUtil;
import com.cnpanoramio.utils.UserUtil;

@Controller
@RequestMapping("/api/rest/travel")
public class TravelRestService extends AbstractRestService {

	private transient final Log log = LogFactory.getLog(getClass());
	
	@Autowired
	private UserManager userManager = null;
	
	@Autowired
	private TravelManager travelManager;
	@Autowired
	private TravelService travelService;
	
	@Autowired
	private PhotoManager photoManager;
	
	@RequestMapping(method = RequestMethod.POST)
	@ResponseBody
	public TravelResponse create(@RequestParam("travel") String travel) {
		TravelResponse response = new TravelResponse();
		
		User me = UserUtil.getCurrentUser(userManager);
		response.setTravels(travelService.createMyTravel(me, travel));
		response.setStatus(TravelResponse.Status.OK.name());
		return response;
	}
	
	@RequestMapping(value = "/{travelId}", method = RequestMethod.POST)
	@ResponseBody
	public TravelResponse addPhotos(@PathVariable String travelId, @RequestParam("photos") String photos) {
		TravelResponse response = responseFactory();
		User me = UserUtil.getCurrentUser(userManager);
		String[] ps = photos.split(",");
		for(String id : ps) {
			Photo photo = photoManager.getPhoto(Long.parseLong(id));
			if(photo.getOwner().equals(me)) {
				travelManager.addTravelPhoto(Long.parseLong(travelId), photo);
			}else {
				throw new AccessDeniedException("Access Denied! Photo Id: " + photo.getId());
			}
		}
		return response;
	}
	
	@RequestMapping(value = "/{travelId}", method = RequestMethod.GET)
	@ResponseBody
	public TravelResponse getTravel(@PathVariable String travelId) {
		TravelResponse response = responseFactory();
		response.setTravel(travelService.getTravel(Long.parseLong(travelId)));
		return response;
	}
	
	/**
	 * 创建范围对象的工厂方法，默认为OK状态
	 * 
	 * @return
	 */
	protected TravelResponse responseFactory() {
		TravelResponse response = new TravelResponse();
		response.setStatus(TravelResponse.Status.OK.name());
		return response;
	}
}
